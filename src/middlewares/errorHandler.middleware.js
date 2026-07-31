import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
import { errorResponse } from '../utils/response.js';
import { ERROR_MESSAGES } from '../constants/messages.constants.js';
import multer from 'multer';

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, HTTP_STATUS.PAYLOAD_TOO_LARGE || 413, ERROR_MESSAGES.FILE_TOO_LARGE, [err.message]);
    }
    return errorResponse(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.FILE_UPLOAD_ERROR, [err.message]);
  }

  const statusCode = err.statusCode || err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

  return errorResponse(res, statusCode, message);
};
