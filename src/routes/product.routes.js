import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import * as productValidator from '../validators/product.validator.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { getUploadMiddleware } from '../middlewares/upload.middleware.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { authorizePermissions } from '../middlewares/rbac.middleware.js';
import { PERMISSIONS } from '../constants/rbac.constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const publicProductRouter = Router();
export const adminProductRouter = Router();

const upload = getUploadMiddleware('products');

// PUBLIC ENDPOINTS (/api/v1/products)
publicProductRouter.get(
  '/', 
  productValidator.getProductsValidator, 
  validateRequest, 
  asyncHandler(productController.getProducts)
);

publicProductRouter.get(
  '/:id', 
  productValidator.getProductByIdValidator, 
  validateRequest, 
  asyncHandler(productController.getProductById)
);

// ADMIN ENDPOINTS (/api/v1/admin/products)
adminProductRouter.use(protectRoute);
adminProductRouter.use(authorizePermissions(PERMISSIONS.MANAGE_PRODUCTS));

adminProductRouter.post(
  '/', 
  upload.single('image'), 
  productValidator.createProductValidator, 
  validateRequest, 
  asyncHandler(productController.createProduct)
);

adminProductRouter.put(
  '/:id', 
  upload.single('image'), 
  productValidator.updateProductValidator, 
  validateRequest, 
  asyncHandler(productController.updateProduct)
);

adminProductRouter.delete(
  '/:id', 
  productValidator.deleteProductValidator, 
  validateRequest, 
  asyncHandler(productController.deleteProduct)
);
