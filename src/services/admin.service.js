import bcrypt from 'bcrypt';
import * as adminRepo from '../repositories/admin.repository.js';
import { getPaginationData, getOffset } from '../utils/pagination.js';
import { ROLES } from '../constants/rbac.constants.js';
export const getAdmins = async ({ page, limit, search, sort }) => {
  const offset = getOffset(page, limit);
  const totalItems = await adminRepo.countAdmins(search);
  
  const adminList = await adminRepo.getAdmins(limit || 12, offset, search, sort || 'newest');
  
  const pagination = getPaginationData(page, limit, totalItems);
  
  return { data: adminList, pagination };
};

export const getAdminById = async (id) => {
  const admin = await adminRepo.getAdminById(id);
  if (!admin) {
    const error = new Error('Administrator not found');
    error.statusCode = 404;
    throw error;
  }
  return admin;
};

export const createAdmin = async (data) => {
  // Check if username already exists
  const existingAdmin = await adminRepo.getAdminByUsername(data.username);
  if (existingAdmin) {
    const error = new Error('Username already exists');
    error.statusCode = 409;
    throw error;
  }

  // Hash the password
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(data.password, saltRounds);

  // Security check: Prevent creating SUPER_ADMIN
  if (data.role === ROLES.SUPER_ADMIN) {
    const error = new Error('Cannot create an administrator with SUPER_ADMIN role');
    error.statusCode = 403;
    throw error;
  }

  const newAdmin = await adminRepo.createAdmin({
    username: data.username,
    password_hash: passwordHash,
    full_name: data.full_name,
    role: data.role
  });

  return newAdmin;
};

export const deleteAdmin = async (id) => {
  // 1. Check if admin exists
  const existingAdmin = await adminRepo.getAdminById(id);
  if (!existingAdmin) {
    const error = new Error('Administrator not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Prevent deleting the last remaining SUPER_ADMIN
  if (existingAdmin.role === ROLES.SUPER_ADMIN) {
    const superAdminCount = await adminRepo.countAdminsByRole(ROLES.SUPER_ADMIN);
    if (superAdminCount <= 1) {
      const error = new Error('Cannot delete the last remaining SUPER_ADMIN.');
      error.statusCode = 403;
      throw error;
    }
  }

  // 3. Delete the admin
  await adminRepo.deleteAdmin(id);
};
