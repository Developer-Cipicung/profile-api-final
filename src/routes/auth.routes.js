import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as authValidator from '../validators/auth.validator.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authRouter = Router();

// PUBLIC ENDPOINT (/api/v1/auth/login)
authRouter.post(
  '/login',
  authValidator.loginValidator,
  validateRequest,
  asyncHandler(authController.login)
);
