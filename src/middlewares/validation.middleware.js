import { validationResult } from 'express-validator';
import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
import { errorResponse } from '../utils/response.js';
import { ERROR_MESSAGES } from '../constants/messages.constants.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({ [err.path || err.param]: err.msg }));
    return errorResponse(res, HTTP_STATUS.UNPROCESSABLE_ENTITY, ERROR_MESSAGES.VALIDATION_ERROR, extractedErrors);
  }
  next();
};
