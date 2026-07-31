import { supabase } from '../config/supabase.js';

export const countAdmins = async (search, client = null) => {
  let query = supabase.from('admins').select('*', { count: 'exact', head: true });
  
  if (search) {
    query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
  }
  
  const { count, error } = await query;
  if (error) throw error;
  return count;
};

export const countAdminsByRole = async (role, client = null) => {
  const { count, error } = await supabase
    .from('admins')
    .select('*', { count: 'exact', head: true })
    .eq('role', role);
    
  if (error) throw error;
  return count;
};

export const getAdmins = async (limit, offset, search, sortBy, client = null) => {
  let query = supabase.from('admins').select('id, username, full_name, role, created_at, updated_at');
  
  if (search) {
    query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
  }
  
  if (sortBy === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else if (sortBy === 'username') {
    query = query.order('username', { ascending: true });
  } else if (sortBy === 'full_name') {
    query = query.order('full_name', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false }); // default newest
  }
  
  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
};

export const getAdminById = async (id, client = null) => {
  const { data, error } = await supabase
    .from('admins')
    .select('id, username, full_name, role, created_at, updated_at')
    .eq('id', id)
    .maybeSingle();
    
  if (error) throw error;
  return data;
};

export const getAdminByUsername = async (username, client = null) => {
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('username', username)
    .maybeSingle();
    
  if (error) throw error;
  return data;
};

export const createAdmin = async (adminData, client = null) => {
  const { username, password_hash, full_name, role } = adminData;
  const { data, error } = await supabase
    .from('admins')
    .insert([{ username, password_hash, full_name, role }])
    .select('id, username, full_name, role, created_at, updated_at')
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteAdmin = async (id, client = null) => {
  const { data, error } = await supabase
    .from('admins')
    .delete()
    .eq('id', id)
    .select('id, username')
    .maybeSingle();
    
  if (error) throw error;
  return data;
};
