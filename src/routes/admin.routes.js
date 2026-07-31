import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as adminValidator from '../validators/admin.validator.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { authorizePermissions } from '../middlewares/rbac.middleware.js';
import { PERMISSIONS } from '../constants/rbac.constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const adminAdminRouter = Router();

// ADMIN ENDPOINTS (/api/v1/admin/administrators)
// All endpoints are protected because administrators must be logged in to manage other administrators.

adminAdminRouter.get(
  '/', 
  protectRoute,
  authorizePermissions(PERMISSIONS.MANAGE_ADMINISTRATORS),
  adminValidator.getAdminsValidator, 
  validateRequest, 
  asyncHandler(adminController.getAdmins)
);

adminAdminRouter.get(
  '/:id', 
  protectRoute,
  authorizePermissions(PERMISSIONS.MANAGE_ADMINISTRATORS),
  adminValidator.getAdminByIdValidator, 
  validateRequest, 
  asyncHandler(adminController.getAdminById)
);

adminAdminRouter.post(
  '/', 
  protectRoute,
  authorizePermissions(PERMISSIONS.MANAGE_ADMINISTRATORS),
  adminValidator.createAdminValidator, 
  validateRequest, 
  asyncHandler(adminController.createAdmin)
);

adminAdminRouter.delete(
  '/:id', 
  protectRoute,
  authorizePermissions(PERMISSIONS.MANAGE_ADMINISTRATORS),
  adminValidator.deleteAdminValidator, 
  validateRequest, 
  asyncHandler(adminController.deleteAdmin)
);
