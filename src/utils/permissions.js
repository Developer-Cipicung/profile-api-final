import { ROLE_PERMISSIONS } from '../constants/rbac.constants.js';

/**
 * Checks if a role has a specific permission
 * @param {string} role - The admin role
 * @param {string} permission - The permission to check
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
  if (!role) return false;
  const adminPermissions = ROLE_PERMISSIONS[role] || [];
  return adminPermissions.includes(permission);
};
