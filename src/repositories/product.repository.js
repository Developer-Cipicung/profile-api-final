import { supabase } from '../config/supabase.js';

export const countProducts = async (search, client = null) => {
  let query = supabase.from('products').select('*', { count: 'exact', head: true });
  
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  
  const { count, error } = await query;
  if (error) throw error;
  return count;
};

export const getProducts = async (limit, offset, search, sortBy, client = null) => {
  let query = supabase.from('products').select('id, name, description, price, no_telp, shopee_url, image_url, created_at, updated_at');
  
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  
  if (sortBy === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else if (sortBy === 'name') {
    query = query.order('name', { ascending: true });
  } else if (sortBy === 'price') {
    query = query.order('price', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false });
  }
  
  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
};

export const getProductById = async (id, client = null) => {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, no_telp, shopee_url, image_url, created_at, updated_at')
    .eq('id', id)
    .maybeSingle();
    
  if (error) throw error;
  return data;
};

export const createProduct = async (productData, client = null) => {
  const { name, description, price, no_telp, shopee_url, image_url } = productData;
  const { data, error } = await supabase
    .from('products')
    .insert([{ name, description, price, no_telp, shopee_url, image_url }])
    .select('id, name, description, price, no_telp, shopee_url, image_url, created_at, updated_at')
    .single();
    
  if (error) throw error;
  return data;
};

export const updateProduct = async (id, productData, client = null) => {
  // Strip out undefined values
  const payload = Object.fromEntries(Object.entries(productData).filter(([_, v]) => v !== undefined));
  payload.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select('id, name, description, price, no_telp, shopee_url, image_url, created_at, updated_at')
    .maybeSingle();
    
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id, client = null) => {
  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .select('id, image_url')
    .maybeSingle();
    
  if (error) throw error;
  return data;
};
