-- Phase F1 & F2: Population Infrastructure Schema Updates

-- 1. Extend population_sources table
ALTER TABLE population_sources
ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT 'Population Data',
ADD COLUMN IF NOT EXISTS spreadsheet_url TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS worksheet_name VARCHAR(255) NOT NULL DEFAULT 'CIPICUNG',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS last_crawled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_crawl_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_error TEXT;

-- 2. Create population_snapshots table
CREATE TABLE IF NOT EXISTS population_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES population_sources(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 1900),
  current_population INTEGER NOT NULL DEFAULT 0,
  birth_total INTEGER NOT NULL DEFAULT 0,
  death_total INTEGER NOT NULL DEFAULT 0,
  move_in_total INTEGER NOT NULL DEFAULT 0,
  move_out_total INTEGER NOT NULL DEFAULT 0,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(month, year)
);

-- 3. Create population_snapshot_details table for RT/RW level data
CREATE TABLE IF NOT EXISTS population_snapshot_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID NOT NULL REFERENCES population_snapshots(id) ON DELETE CASCADE,
  rw INTEGER NOT NULL,
  rt INTEGER NOT NULL,
  current_population INTEGER NOT NULL DEFAULT 0,
  birth_count INTEGER NOT NULL DEFAULT 0,
  death_count INTEGER NOT NULL DEFAULT 0,
  move_in_count INTEGER NOT NULL DEFAULT 0,
  move_out_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(snapshot_id, rw, rt)
);

-- 4. Create RPC to safely activate a single source atomically
CREATE OR REPLACE FUNCTION activate_population_source(target_id UUID)
RETURNS void AS $$
BEGIN
  -- Deactivate all sources
  UPDATE population_sources SET is_active = false WHERE is_active = true;
  -- Activate the target source
  UPDATE population_sources SET is_active = true WHERE id = target_id;
END;
$$ LANGUAGE plpgsql;
