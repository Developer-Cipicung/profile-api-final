import { populationService } from "../services/population.service.js";

export const populationController = {
  getSummary: async (req, res, next) => {
    try {
      const summary = await populationService.getLatestSummary();
      if (!summary) {
        return res.status(404).json({
          success: false,
          message: "No population data available yet.",
        });
      }
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  },

  getSources: async (req, res, next) => {
    try {
      const sources = await populationService.getAllSources();
      res.status(200).json({
        success: true,
        data: sources,
      });
    } catch (error) {
      next(error);
    }
  },

  createSource: async (req, res, next) => {
    try {
      const source = await populationService.createSource(req.body);
      res.status(201).json({
        success: true,
        message: "Population source created successfully",
        data: source,
      });
    } catch (error) {
      next(error);
    }
  },

  updateSource: async (req, res, next) => {
    try {
      const source = await populationService.updateSource(
        req.params.id,
        req.body,
      );
      res.status(200).json({
        success: true,
        message: "Population source updated successfully",
        data: source,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteSource: async (req, res, next) => {
    try {
      await populationService.deleteSource(req.params.id);
      res.status(200).json({
        success: true,
        message: "Population source deleted successfully",
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  activateSource: async (req, res, next) => {
    try {
      const source = await populationService.activateSource(req.params.id);
      res.status(200).json({
        success: true,
        message: "Population source activated successfully",
        data: source,
      });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  },

  crawl: async (req, res, next) => {
    try {
      const { sourceId, month, year } = req.body;
      const result = await populationService.crawlSpreadsheet(
        sourceId,
        month,
        year,
      );
      res.status(200).json({
        success: true,
        message: "Crawl completed successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getHistory: async (req, res, next) => {
    try {
      const filters = {
        month: req.query.month,
        year: req.query.year,
        source_id: req.query.source_id,
        search: req.query.search,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
      };

      const { data, count } = await populationService.getHistory(filters);

      res.status(200).json({
        success: true,
        data,
        count,
      });
    } catch (error) {
      next(error);
    }
  },

  getSnapshotDetails: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await populationService.getSnapshotDetails(id);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  getTrends: async (req, res, next) => {
    try {
      const filters = {
        year: req.query.year,
        month: req.query.month,
        source_id: req.query.source_id,
        limit: req.query.limit,
      };
      const data = await populationService.getTrends(filters);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteSnapshot: async (req, res, next) => {
    try {
      const { id } = req.params;
      await populationService.deleteSnapshot(id);

      res.status(200).json({
        success: true,
        message: "Snapshot deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  getFilters: async (req, res, next) => {
    try {
      const filters = await populationService.getAvailableFilters();
      
      const yearlyCounts = filters.reduce((acc, curr) => {
        acc[curr.year] = (acc[curr.year] || 0) + 1;
        return acc;
      }, {});

      res.status(200).json({
        success: true,
        data: {
          filters,
          yearlyCounts
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
