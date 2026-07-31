import * as XLSX from 'xlsx';

/**
 * Isolated parser for the Population Spreadsheet.
 * All logic about HOW the spreadsheet is structured belongs here.
 */

// Helper to normalize header names
const normalizeHeader = (header) => {
  if (!header || typeof header !== 'string') return '';
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Parses the population spreadsheet buffer and extracts the CIPICUNG worksheet.
 * @param {ArrayBuffer} buffer - The downloaded spreadsheet as a buffer
 * @returns {Object} { details: Array, totals: Object }
 */
const MONTH_NAMES = [
  'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
];

export const parsePopulationSpreadsheet = (buffer, worksheetName = 'CIPICUNG') => {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  
  const worksheet = workbook.Sheets[worksheetName];
  
  if (!worksheet) {
    throw new Error(`Spreadsheet must contain a worksheet named '${worksheetName}'. Worksheets found: ${workbook.SheetNames.join(', ')}`);
  }

  const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: 0, header: 1 });
  
  if (rawData.length < 2) {
    throw new Error('Spreadsheet is empty or missing headers.');
  }

  const snapshots = [];
  let currentBlockStart = -1;
  let currentMonth = null;
  let currentYear = null;

  // Scan for all blocks
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (row && row[0]) {
      const firstCell = String(row[0]).toUpperCase().trim();
      
      // Look for "BULAN <MONTH_NAME> <YEAR>"
      if (firstCell.startsWith('BULAN ')) {
        const parts = firstCell.split(' ');
        if (parts.length >= 3) {
          const monthName = parts[1];
          const yearStr = parts[2];
          
          const monthIdx = MONTH_NAMES.indexOf(monthName);
          if (monthIdx !== -1) {
            // If we are already tracking a block, we can parse it before starting the next one.
            // But it's simpler to just collect the block start indices and parse them sequentially later.
            // Let's do it right here using a helper function.
            currentMonth = monthIdx + 1;
            currentYear = parseInt(yearStr, 10);
            currentBlockStart = i;
            
            try {
              const snapshotData = parseBlock(rawData, currentBlockStart, currentMonth, currentYear, firstCell);
              snapshots.push(snapshotData);
            } catch (err) {
              console.error(`Skipping block ${firstCell} due to error: ${err.message}`);
              // Continue to the next block even if this one fails (e.g. empty month)
            }
          }
        }
      }
    }
  }

  if (snapshots.length === 0) {
    throw new Error(`Could not find any valid monthly data blocks (e.g., 'BULAN JANUARI 2026') in the spreadsheet.`);
  }

  return snapshots;
};

// Helper function to parse a single block
function parseBlock(rawData, blockStartIdx, month, year, targetTitle) {
  let headerRowIdx = -1;
  let rtrwCol = -1;
  let lahirCol = -1;
  let meninggalCol = -1;
  let pindahCol = -1;
  let datangCol = -1;
  let akhirCol = -1;
  let kkCol = -1;

  for (let i = blockStartIdx; i < Math.min(blockStartIdx + 20, rawData.length); i++) {
    const row = rawData[i];
    for (let j = 0; j < row.length; j++) {
      const cell = String(row[j] || '').toLowerCase().replace(/\s+/g, '');
      if (cell.includes('rt/rw')) {
        headerRowIdx = i;
        rtrwCol = j;
      } else if (cell.includes('lahir')) {
        lahirCol = j;
      } else if (cell.includes('meninggal') || cell.includes('mati')) {
        meninggalCol = j;
      } else if (cell.includes('pindah') || cell.includes('keluar')) {
        pindahCol = j;
      } else if (cell.includes('datang') || cell.includes('masuk')) {
        datangCol = j;
      } else if (cell.includes('akhir')) {
        akhirCol = j;
      } else if (cell.includes('kk')) {
        kkCol = j;
      }
    }
    if (headerRowIdx !== -1) break; 
  }

  if (headerRowIdx === -1 || rtrwCol === -1) {
    throw new Error(`Found ${targetTitle} block, but missing "RT/RW" column header.`);
  }

  const colIndexes = {
    rtrw: rtrwCol,
    kk: kkCol,
    birth: lahirCol !== -1 ? lahirCol + 2 : -1,
    death: meninggalCol !== -1 ? meninggalCol + 2 : -1,
    moveOut: pindahCol !== -1 ? pindahCol + 2 : -1,
    moveIn: datangCol !== -1 ? datangCol + 2 : -1,
    current_population: akhirCol !== -1 ? akhirCol + 2 : -1,
    male: akhirCol !== -1 ? akhirCol : -1,
    female: akhirCol !== -1 ? akhirCol + 1 : -1
  };

  const details = [];
  let totals = {
    current_population: 0,
    birth_total: 0,
    death_total: 0,
    move_in_total: 0,
    move_out_total: 0,
    family_total: 0,
    male_total: 0,
    female_total: 0
  };

  const rtrwRegex = /^0*(\d{1,3})\s*\/\s*0*(\d{1,3})$/;

  for (let i = headerRowIdx + 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length === 0) continue;
    
    const firstCellText = String(row[0] || '').toUpperCase();
    if (firstCellText.includes('JUMLAH') || firstCellText.includes('LAPORAN PENDUDUK')) {
      break;
    }
    
    const rtrwRaw = String(row[colIndexes.rtrw] || '').trim();
    const match = rtrwRaw.match(rtrwRegex);
    
    if (!match) continue;

    const rtVal = parseInt(match[1], 10);
    const rwVal = parseInt(match[2], 10);

    const parseNum = (idx) => {
      if (idx === -1 || idx >= row.length) return 0;
      const val = parseInt(row[idx], 10);
      return isNaN(val) ? 0 : val;
    };

    const detailRow = {
      rw: rwVal,
      rt: rtVal,
      current_population: parseNum(colIndexes.current_population),
      birth_count: parseNum(colIndexes.birth),
      death_count: parseNum(colIndexes.death),
      move_out_count: parseNum(colIndexes.moveOut),
      move_in_count: parseNum(colIndexes.moveIn),
      family_count: parseNum(colIndexes.kk),
      male_count: parseNum(colIndexes.male),
      female_count: parseNum(colIndexes.female)
    };

    if (details.some(d => d.rt === rtVal && d.rw === rwVal)) {
      throw new Error(`Duplicate RT/RW found in ${targetTitle}: RT ${rtVal} / RW ${rwVal}.`);
    }

    details.push(detailRow);

    totals.current_population += detailRow.current_population;
    totals.birth_total += detailRow.birth_count;
    totals.death_total += detailRow.death_count;
    totals.move_in_total += detailRow.move_in_count;
    totals.move_out_total += detailRow.move_out_count;
    totals.family_total += detailRow.family_count;
    totals.male_total += detailRow.male_count;
    totals.female_total += detailRow.female_count;
  }

  if (details.length === 0) {
    throw new Error('No valid RT/RW data rows found.');
  }

  return { month, year, details, totals };
}
