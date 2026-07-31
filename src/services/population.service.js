import { populationRepository } from "../repositories/population.repository.js";
import { parsePopulationSpreadsheet } from "../utils/spreadsheetParser.js";

/**
 * Extracts the document ID from a Google Sheets URL and constructs the direct XLSX export URL.
 * @param {string} url - Original Google Sheets URL
 * @returns {string} - XLSX Export URL
 */
const getExportUrl = (url) => {
  // Typical URL: https://docs.google.com/spreadsheets/d/1X2Y3Z.../edit#gid=0
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match || !match[1]) {
    throw new Error("Invalid Google Spreadsheet URL format.");
  }
  const documentId = match[1];
  return `https://docs.google.com/spreadsheets/d/${documentId}/export?format=xlsx`;
};

/**
 * Normalize Google Sheets URL for storage
 */
const normalizeSpreadsheetUrl = (url) => {
  if (!url) return url;
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match || !match[1]) {
    throw { status: 400, message: "Invalid Google Spreadsheet URL format." };
  }
  return `https://docs.google.com/spreadsheets/d/${match[1]}`;
};

export const populationService = {
  getLatestSummary: async () => {
    const topSnapshots = await populationRepository.getTopSnapshots(2);
    if (!topSnapshots || topSnapshots.length === 0) return null;

    const current = topSnapshots[0];
    const previous = topSnapshots.length > 1 ? topSnapshots[1] : null;

    const netGrowth =
      current.birth_total +
      current.move_in_total -
      current.death_total -
      current.move_out_total;
    const diff = previous
      ? current.current_population - previous.current_population
      : 0;

    return {
      current_population: current.current_population,
      birth_total: current.birth_total,
      death_total: current.death_total,
      move_in_total: current.move_in_total,
      move_out_total: current.move_out_total,
      population_increase: current.birth_total + current.move_in_total,
      population_decrease: current.death_total + current.move_out_total,
      net_growth: netGrowth,
      net_change: diff, // from previous snapshot
      month: current.month,
      year: current.year,
      last_imported: current.imported_at,
      sum_kk: current.family_count,
      male_count: current.male_count,
      female_count: current.female_count,
      sum_rw: 7,
      sum_rt: 33,
      sum_dusun: 3,
    };
  },

  getAllSources: async () => {
    return populationRepository.getAllSources();
  },

  createSource: async (data) => {
    if (data.spreadsheet_url) {
      data.spreadsheet_url = normalizeSpreadsheetUrl(data.spreadsheet_url);
    }

    // If this is set to active, use atomic activate later, but during create it's simpler
    // to just create it as inactive and then activate it to guarantee atomic behavior.
    const shouldActivate = data.is_active;
    data.is_active = false; // force false initially

    const newSource = await populationRepository.createSource(data);

    if (shouldActivate) {
      return populationRepository.activateSource(newSource.id);
    }
    return newSource;
  },

  updateSource: async (id, data) => {
    if (data.spreadsheet_url) {
      data.spreadsheet_url = normalizeSpreadsheetUrl(data.spreadsheet_url);
    }

    const shouldActivate = data.is_active === true;
    if ("is_active" in data) {
      delete data.is_active; // Handle activation via activateSource to ensure atomic flow
    }

    let updated = await populationRepository.updateSource(id, data);

    if (shouldActivate) {
      updated = await populationRepository.activateSource(id);
    }
    return updated;
  },

  deleteSource: async (id) => {
    const source = await populationRepository.getSourceById(id);
    if (!source) {
      throw { status: 404, message: "Source not found." };
    }
    if (source.is_active) {
      throw {
        status: 400,
        message:
          "Cannot delete an active source. Please activate another source first.",
      };
    }

    const hasSnapshots = await populationRepository.hasSnapshots(id);
    if (hasSnapshots) {
      throw {
        status: 400,
        message:
          "Cannot delete this source because it contains historical snapshots.",
      };
    }

    return populationRepository.deleteSource(id);
  },

  activateSource: async (id) => {
    const source = await populationRepository.getSourceById(id);
    if (!source) {
      throw { status: 404, message: "Source not found." };
    }
    return populationRepository.activateSource(id);
  },

  crawlSpreadsheet: async (sourceId) => {
    try {
      // 1. Get the source details
      const source = await populationRepository.getSourceById(sourceId);
      if (!source) {
        throw { status: 404, message: "Source not found." };
      }

      if (!source.is_active) {
        throw { status: 400, message: "Only active sources can be crawled." };
      }

      // 2. Fetch the spreadsheet
      const exportUrl = `${source.spreadsheet_url}/export?format=xlsx`;
      const response = await fetch(exportUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to download spreadsheet. Status: ${response.status}`,
        );
      }

      const arrayBuffer = await response.arrayBuffer();

      // 3. Parse data (returns an array of monthly snapshots)
      const parsedSnapshots = parsePopulationSpreadsheet(
        arrayBuffer,
        source.worksheet_name,
      );

      const now = new Date();
      const importedAt = now.toISOString();

      let snapshotsInserted = 0;

      // 4. Iterate over each extracted month and upsert
      for (const parsed of parsedSnapshots) {
        const snapshotData = {
          source_id: source.id,
          month: parsed.month,
          year: parsed.year,
          current_population: parsed.totals.current_population,
          birth_total: parsed.totals.birth_total,
          death_total: parsed.totals.death_total,
          move_in_total: parsed.totals.move_in_total,
          move_out_total: parsed.totals.move_out_total,
          family_count: parsed.totals.family_total,
          male_count: parsed.totals.male_total,
          female_count: parsed.totals.female_total,
          imported_at: importedAt,
        };

        const snapshot =
          await populationRepository.upsertSnapshot(snapshotData);

        // Delete old details if any, and insert new details
        await populationRepository.deleteSnapshotDetails(snapshot.id);

        const detailsToInsert = parsed.details.map((row) => ({
          snapshot_id: snapshot.id,
          rw: row.rw,
          rt: row.rt,
          current_population: row.current_population,
          birth_count: row.birth_count,
          death_count: row.death_count,
          move_in_count: row.move_in_count,
          move_out_count: row.move_out_count,
          family_count: row.family_count,
          male_count: row.male_count,
          female_count: row.female_count,
        }));

        await populationRepository.insertSnapshotDetails(detailsToInsert);
        snapshotsInserted++;
      }

      // 5. Update source status
      await populationRepository.updateSource(source.id, {
        last_crawled_at: importedAt,
        last_crawl_status: "SUCCESS",
        last_error: null,
      });

      return {
        source_id: source.id,
        source_name: source.name,
        worksheet_name: source.worksheet_name,
        months_processed: snapshotsInserted,
        imported_at: importedAt,
        status: "SUCCESS",
        message: `Successfully crawled ${snapshotsInserted} month(s) of data.`,
      };
    } catch (error) {
      // Update source to Failed
      await populationRepository.updateSource(sourceId, {
        last_crawl_status: "FAILED",
        last_crawled_at: new Date().toISOString(),
        last_error: error.message || "Unknown error occurred during crawl",
      });

      throw {
        status: 400,
        message: error.message || "Failed to crawl spreadsheet",
      };
    }
  },

  getHistory: async (filters) => {
    return populationRepository.getHistory(filters);
  },

  getSnapshotDetails: async (id) => {
    const snapshot = await populationRepository.getSnapshotById(id);
    if (!snapshot) {
      throw { status: 404, message: "Snapshot not found." };
    }
    const details = await populationRepository.getSnapshotDetailsById(id);
    return {
      snapshot,
      details,
    };
  },

  getTrends: async (filters) => {
    return populationRepository.getTrends(filters);
  },

  deleteSnapshot: async (id) => {
    const topSnapshots = await populationRepository.getTopSnapshots(1);
    if (topSnapshots && topSnapshots.length > 0 && topSnapshots[0].id === id) {
      throw { status: 409, message: "The latest snapshot cannot be deleted." };
    }
    return populationRepository.deleteSnapshot(id);
  },

  getAvailableFilters: async () => {
    return populationRepository.getAvailableFilters();
  },
};
