import { supabase } from '../config/supabase.js';

export const populationRepository = {
  /**
   * Get all population sources.
   */
  getAllSources: async () => {
    const { data, error } = await supabase
      .from('population_sources')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  /**
   * Get the currently active population source (spreadsheet).
   */
  getActiveSource: async () => {
    const { data, error } = await supabase
      .from('population_sources')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }
    return data; // null if not found
  },

  /**
   * Deactivate all current sources.
   * Useful when switching the active source.
   */
  deactivateAllSources: async () => {
    const { error } = await supabase
      .from('population_sources')
      .update({ is_active: false })
      .eq('is_active', true);
    
    if (error) throw error;
    return true;
  },

  /**
   * Get a population source by ID.
   */
  getSourceById: async (id) => {
    const { data, error } = await supabase
      .from('population_sources')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Activate a source atomically.
   */
  activateSource: async (id) => {
    const { error } = await supabase.rpc('activate_population_source', { target_id: id });
    if (error) {
      // Fallback if RPC not installed
      if (error.code === 'PGRST202') {
        await populationRepository.deactivateAllSources();
        const { data, error: updateError } = await supabase
          .from('population_sources')
          .update({ is_active: true })
          .eq('id', id)
          .select()
          .single();
        if (updateError) throw updateError;
        return data;
      }
      throw error;
    }
    return populationRepository.getSourceById(id);
  },

  /**
   * Delete a population source.
   */
  deleteSource: async (id) => {
    const { error } = await supabase
      .from('population_sources')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  /**
   * Check if a source has historical snapshots.
   */
  hasSnapshots: async (sourceId) => {
    const { count, error } = await supabase
      .from('population_snapshots')
      .select('id', { count: 'exact', head: true })
      .eq('source_id', sourceId);
    
    if (error) throw error;
    return count > 0;
  },

  /**
   * Create a new population source.
   */
  createSource: async (sourceData) => {
    const { data, error } = await supabase
      .from('population_sources')
      .insert([sourceData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Update a population source.
   */
  updateSource: async (id, updateData) => {
    const { data, error } = await supabase
      .from('population_sources')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Upsert a snapshot for a given month/year.
   * If one exists for the month/year, it replaces the values.
   */
  upsertSnapshot: async (snapshotData) => {
    const { data, error } = await supabase
      .from('population_snapshots')
      .upsert(snapshotData, { 
        onConflict: 'month,year',
        ignoreDuplicates: false // we want to overwrite
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete existing snapshot details.
   * Used before inserting new details during a re-crawl of the same month/year.
   */
  deleteSnapshotDetails: async (snapshotId) => {
    const { error } = await supabase
      .from('population_snapshot_details')
      .delete()
      .eq('snapshot_id', snapshotId);
    
    if (error) throw error;
    return true;
  },

  /**
   * Insert new snapshot details.
   */
  insertSnapshotDetails: async (details) => {
    if (!details || details.length === 0) return;
    
    const { error } = await supabase
      .from('population_snapshot_details')
      .insert(details);
    
    if (error) throw error;
  },

  /**
   * Get all population snapshots with filtering and pagination.
   */
  getHistory: async (filters = {}) => {
    let query = supabase
      .from('population_snapshots')
      .select('*, source:population_sources(name)', { count: 'exact' });

    if (filters.month) {
      query = query.eq('month', filters.month);
    }
    if (filters.year) {
      query = query.eq('year', filters.year);
    }
    if (filters.source_id) {
      query = query.eq('source_id', filters.source_id);
    }
    if (filters.search) {
      // Assuming search might want to find by source name, but source is joined.
      // We will filter by year or month if search is numeric, or we just rely on month/year filters.
    }

    // Sorting
    const sortField = filters.sortBy || 'year';
    const sortOrder = filters.sortOrder === 'asc';
    query = query.order(sortField, { ascending: sortOrder });
    if (sortField === 'year') {
      query = query.order('month', { ascending: sortOrder }); // secondary sort
    }

    const { data, error, count } = await query;
    if (error) throw error;
    
    return { data, count };
  },

  /**
   * Get a snapshot by ID including its source metadata.
   */
  getSnapshotById: async (id) => {
    const { data, error } = await supabase
      .from('population_snapshots')
      .select('*, source:population_sources(*)')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get detail rows for a specific snapshot.
   */
  getSnapshotDetailsById: async (snapshotId) => {
    const { data, error } = await supabase
      .from('population_snapshot_details')
      .select('*')
      .eq('snapshot_id', snapshotId)
      .order('rw', { ascending: true })
      .order('rt', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  /**
   * Get chronological snapshots for trend charts.
   */
  getTrends: async (filters = {}) => {
    let query = supabase
      .from('population_snapshots')
      .select('id, month, year, current_population, birth_total, death_total, move_in_total, move_out_total')
      .order('year', { ascending: true })
      .order('month', { ascending: true });
    
    if (filters.year) {
      query = query.eq('year', filters.year);
    }
    if (filters.month) {
      query = query.eq('month', filters.month);
    }
    if (filters.source_id) {
      query = query.eq('source_id', filters.source_id);
    }
    if (filters.limit) {
      query = query.limit(parseInt(filters.limit, 10));
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Delete a population snapshot. Detail rows cascade based on FK, but we explicitly delete here if cascade is not set.
   * Assuming FK has ON DELETE CASCADE from Phase F1, but we can do a safe delete.
   */
  deleteSnapshot: async (id) => {
    const { error } = await supabase
      .from('population_snapshots')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  /**
   * Get the top N snapshots ordered by date descending (for diffs).
   */
  getTopSnapshots: async (limit = 2) => {
    const { data, error } = await supabase
      .from('population_snapshots')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  /**
   * Get the most recent snapshot for the dashboard summary.
   */
  getLatestSnapshotSummary: async () => {
    const { data, error } = await supabase
      .from('population_snapshots')
      .select('*')
      .order('imported_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data; // null if not found
  },

  /**
   * Get all unique combinations of year, month, and source_id.
   */
  getAvailableFilters: async () => {
    const { data, error } = await supabase
      .from('population_snapshots')
      .select('year, month, source_id, source:population_sources(name)')
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
