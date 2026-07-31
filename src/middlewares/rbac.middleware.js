import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
import { errorResponse } from '../utils/response.js';
import { hasPermission } from '../utils/permissions.js';

export const authorizePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    // req.admin should be populated by protectRoute middleware
    if (!req.admin || !req.admin.role) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, 'Forbidden: Role not found');
    }

    const authorized = requiredPermissions.some(permission => hasPermission(req.admin.role, permission));

    if (!authorized) {
      return errorResponse(res, HTTP_STATUS.FORBIDDEN, 'Forbidden: You do not have permission to access this resource');
    }

    next();
  };
};
