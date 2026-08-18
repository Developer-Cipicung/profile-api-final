-- Enable extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TABLE: admins
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
    username VARCHAR(100) UNIQUE NOT NULL CHECK (char_length(trim(username)) > 0),
    role VARCHAR(50) NOT NULL DEFAULT 'PROFILE_ADMIN' CHECK (role IN ('SUPER_ADMIN', 'PROFILE_ADMIN', 'MARKETING_ADMIN')),
    password_hash TEXT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: news
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL CHECK (char_length(trim(title)) > 0),
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
    thumbnail_url TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for news
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at);
CREATE INDEX IF NOT EXISTS idx_news_title ON news(title);

-- TABLE: products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL CHECK (char_length(trim(name)) > 0),
    description VARCHAR(255) NOT NULL CHECK (char_length(trim(description)) > 0 AND char_length(description) <= 255),
    price INTEGER NOT NULL CHECK (price > 0),
    no_telp VARCHAR(20) NULL,
    shopee_url TEXT NULL,
    image_url TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- TABLE: population_sources
CREATE TABLE IF NOT EXISTS population_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    spreadsheet_url TEXT NOT NULL,
    worksheet_name VARCHAR(255) NOT NULL DEFAULT 'CIPICUNG',
    is_active BOOLEAN NOT NULL DEFAULT false,
    last_crawled_at TIMESTAMP NULL,
    last_crawl_status VARCHAR(50) NULL,
    last_error TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Partial index to ensure only one active source at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_population_sources_active 
ON population_sources (is_active) 
WHERE is_active = true;

-- TABLE: population_snapshots
CREATE TABLE IF NOT EXISTS population_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES population_sources(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 9999),
    current_population INTEGER NOT NULL DEFAULT 0,
    birth_total INTEGER NOT NULL DEFAULT 0,
    death_total INTEGER NOT NULL DEFAULT 0,
    move_in_total INTEGER NOT NULL DEFAULT 0,
    move_out_total INTEGER NOT NULL DEFAULT 0,
    family_count INTEGER NOT NULL DEFAULT 0,
    male_count INTEGER NOT NULL DEFAULT 0,
    female_count INTEGER NOT NULL DEFAULT 0,
    imported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_snapshot_month_year UNIQUE(month, year)
);

-- TABLE: population_snapshot_details
CREATE TABLE IF NOT EXISTS population_snapshot_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID NOT NULL REFERENCES population_snapshots(id) ON DELETE CASCADE,
    rw VARCHAR(50) NOT NULL,
    rt VARCHAR(50) NOT NULL,
    current_population INTEGER NOT NULL DEFAULT 0,
    birth_count INTEGER NOT NULL DEFAULT 0,
    death_count INTEGER NOT NULL DEFAULT 0,
    move_in_count INTEGER NOT NULL DEFAULT 0,
    move_out_count INTEGER NOT NULL DEFAULT 0,
    family_count INTEGER NOT NULL DEFAULT 0,
    male_count INTEGER NOT NULL DEFAULT 0,
    female_count INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT unique_detail_rt_rw_snapshot UNIQUE(snapshot_id, rw, rt)
);

-- Indexes for snapshots and details
CREATE INDEX IF NOT EXISTS idx_population_snapshots_month_year ON population_snapshots(month, year);
CREATE INDEX IF NOT EXISTS idx_population_snapshot_details_snapshot ON population_snapshot_details(snapshot_id);

-- FUNCTION: activate_population_source
-- Ensures atomic activation by deactivating all others in a single transaction
CREATE OR REPLACE FUNCTION activate_population_source(target_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Deactivate any currently active source
    UPDATE population_sources SET is_active = false WHERE is_active = true;
    -- Activate the target source
    UPDATE population_sources SET is_active = true WHERE id = target_id;
END;
$$;
