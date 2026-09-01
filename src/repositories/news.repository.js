import { supabase } from '../config/supabase.js';

export const countNews = async (search, client = null) => {
  let query = supabase.from('news').select('*', { count: 'exact', head: true });
  
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  
  const { count, error } = await query;
  if (error) throw error;
  return count;
};

export const isImageUsed = async (key) => {
  const { count, error } = await supabase
    .from('news')
    .select('*', { count: 'exact', head: true })
    .ilike('content', `%${key}%`);
    
  if (error) throw error;
  return count > 0;
};

export const getNews = async (limit, offset, search, sortBy, client = null) => {
  let query = supabase.from('news').select('id, title, content, thumbnail_url, created_at, updated_at');
  
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  
  const ascending = sortBy === 'oldest';
  query = query.order('created_at', { ascending });
  
  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
};

export const getNewsById = async (id, client = null) => {
  const { data, error } = await supabase
    .from('news')
    .select('id, title, content, thumbnail_url, created_at, updated_at')
    .eq('id', id)
    .maybeSingle();
    
  if (error) throw error;
  return data;
};

export const createNews = async (newsData, client = null) => {
  const { title, content, thumbnail_url, created_at } = newsData;
  const insertPayload = { title, content, thumbnail_url };
  if (created_at) {
    insertPayload.created_at = created_at;
  }
  const { data, error } = await supabase
    .from('news')
    .insert([insertPayload])
    .select('id, title, content, thumbnail_url, created_at, updated_at')
    .single();
    
  if (error) throw error;
  return data;
};

export const updateNews = async (id, newsData, client = null) => {
  // Strip out undefined values
  const payload = Object.fromEntries(Object.entries(newsData).filter(([_, v]) => v !== undefined));
  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('news')
    .update(payload)
    .eq('id', id)
    .select('id, title, content, thumbnail_url, created_at, updated_at')
    .maybeSingle();
    
  if (error) throw error;
  return data;
};

export const deleteNews = async (id, client = null) => {
  const { data, error } = await supabase
    .from('news')
    .delete()
    .eq('id', id)
    .select('id, thumbnail_url')
    .maybeSingle();
    
  if (error) throw error;
  return data;
};
