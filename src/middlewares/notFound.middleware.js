import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
import { errorResponse } from '../utils/response.js';
import { ERROR_MESSAGES } from '../constants/messages.constants.js';

export const notFoundHandler = (req, res) => {
  console.log(`[404] Resource not found: ${req.method} ${req.originalUrl}`);
  return errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
};
