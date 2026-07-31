import { supabase } from '../config/supabase.js';

export const getAdminByUsername = async (username, client = null) => {
  const { data, error } = await supabase
    .from('admins')
    .select('id, username, password_hash, full_name, role')
    .eq('username', username)
    .maybeSingle();
    
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
