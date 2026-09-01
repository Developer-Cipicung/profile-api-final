import { Router } from 'express';
import * as newsController from '../controllers/news.controller.js';
import * as newsValidator from '../validators/news.validator.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { getUploadMiddleware } from '../middlewares/upload.middleware.js';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { authorizePermissions } from '../middlewares/rbac.middleware.js';
import { PERMISSIONS } from '../constants/rbac.constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const publicNewsRouter = Router();
export const adminNewsRouter = Router();

const upload = getUploadMiddleware('news');

adminNewsRouter.use(protectRoute);
adminNewsRouter.use(authorizePermissions(PERMISSIONS.MANAGE_NEWS));

// PUBLIC ENDPOINTS (/api/v1/news)
publicNewsRouter.get(
  '/', 
  newsValidator.getNewsValidator, 
  validateRequest, 
  asyncHandler(newsController.getNews)
);

publicNewsRouter.get(
  '/:id', 
  newsValidator.getNewsByIdValidator, 
  validateRequest, 
  asyncHandler(newsController.getNewsById)
);

// ADMIN ENDPOINTS (/api/v1/admin/news)
adminNewsRouter.post(
  '/', 
  upload.single('thumbnail'), 
  newsValidator.createNewsValidator, 
  validateRequest, 
  asyncHandler(newsController.createNews)
);

adminNewsRouter.post(
  '/images',
  upload.single('image'),
  asyncHandler(newsController.uploadBodyImage)
);

adminNewsRouter.post(
  '/images/cleanup',
  asyncHandler(newsController.cleanupBodyImages)
);

adminNewsRouter.put(
  '/:id', 
  upload.single('thumbnail'), 
  newsValidator.updateNewsValidator, 
  validateRequest, 
  asyncHandler(newsController.updateNews)
);

adminNewsRouter.delete(
  '/:id', 
  newsValidator.deleteNewsValidator, 
  validateRequest, 
  asyncHandler(newsController.deleteNews)
);
