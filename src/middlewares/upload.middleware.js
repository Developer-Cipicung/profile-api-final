import multer from 'multer';
import { UPLOAD_DIRECTORIES, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '../constants/upload.constants.js';
import { generateUniqueFilename } from '../utils/fileHelper.js';
import { ERROR_MESSAGES } from '../constants/messages.constants.js';

export const getUploadMiddleware = (moduleName) => {
  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE), false);
    }
  };

  return multer({
    storage: storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
    fileFilter: fileFilter,
  });
};
