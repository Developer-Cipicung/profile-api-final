import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const baseDir = process.cwd();

const files = {
  'package.json': `{
  "name": "website-profil-desa-cipicung-api",
  "version": "1.0.0",
  "description": "Backend API for Website Profil Desa Cipicung",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  },
  "dependencies": {
    "compression": "^1.7.4",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-validator": "^7.1.0",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "pg": "^8.11.5",
    "uuid": "^9.0.1"
  }
}`,
  '.gitignore': `node_modules/
.env
uploads/
`,
  '.env.example': `PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/desa_cipicung
DEFAULT_NEWS_IMAGE=/uploads/default-news.png
DEFAULT_PRODUCT_IMAGE=/uploads/default-product.png
TZ=Asia/Jakarta
`,
  'src/constants/httpStatus.constants.js': `export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  PAYLOAD_TOO_LARGE: 413
};`,
  'src/constants/messages.constants.js': `export const SUCCESS_MESSAGES = {
  FETCHED: 'Data fetched successfully',
  CREATED: 'Data created successfully',
  UPDATED: 'Data updated successfully',
  DELETED: 'Data deleted successfully',
};

export const ERROR_MESSAGES = {
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  FILE_UPLOAD_ERROR: 'File upload error',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size exceeds the limit',
};`,
  'src/constants/upload.constants.js': `export const UPLOAD_DIRECTORIES = {
  BASE: 'uploads',
  NEWS: 'uploads/news',
  PRODUCTS: 'uploads/products',
};

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB`,
  'src/utils/response.js': `export const successResponse = (res, statusCode, message, data = null, pagination = null) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(pagination && { pagination }),
  };
  return res.status(statusCode).json(response);
};

export const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(response);
};`,
  'src/utils/asyncHandler.js': `export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};`,
  'src/utils/pagination.js': `export const getPaginationData = (page, limit, totalItems) => {
  const currentPage = parseInt(page, 10) || 1;
  const currentLimit = parseInt(limit, 10) || 10;
  const totalPages = Math.ceil(totalItems / currentLimit);

  return {
    page: currentPage,
    limit: currentLimit,
    totalItems: parseInt(totalItems, 10),
    totalPages,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
  };
};

export const getOffset = (page, limit) => {
  const currentPage = parseInt(page, 10) || 1;
  const currentLimit = parseInt(limit, 10) || 10;
  return (currentPage - 1) * currentLimit;
};`,
  'src/utils/fileHelper.js': `import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const createDirectoryIfNotExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

export const createDirectoryIfNotExistsSync = (dirPath) => {
  if (!fsSync.existsSync(dirPath)) {
    fsSync.mkdirSync(dirPath, { recursive: true });
  }
};

export const deleteFile = async (filePath) => {
  if (!filePath) return;
  
  if (filePath.startsWith('/uploads/') || filePath.startsWith('uploads/')) {
      const fullPath = path.join(process.cwd(), filePath.startsWith('/') ? filePath.substring(1) : filePath);
      try {
        await fs.access(fullPath);
        await fs.unlink(fullPath);
      } catch (error) {
        console.error(\`Failed to delete file: \${fullPath}\`, error.message);
      }
  }
};

export const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const uuid = uuidv4();
  return \`\${uuid}-\${timestamp}\${ext}\`;
};`,
  'src/config/db.config.js': `import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL Database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();

export default {
  query,
  getClient,
};`,
  'src/middlewares/errorHandler.middleware.js': `import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
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

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

  return errorResponse(res, statusCode, message);
};`,
  'src/middlewares/notFound.middleware.js': `import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
import { errorResponse } from '../utils/response.js';
import { ERROR_MESSAGES } from '../constants/messages.constants.js';

export const notFoundHandler = (req, res) => {
  return errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
};`,
  'src/middlewares/validation.middleware.js': `import { validationResult } from 'express-validator';
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
};`,
  'src/middlewares/upload.middleware.js': `import multer from 'multer';
import { UPLOAD_DIRECTORIES, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '../constants/upload.constants.js';
import { generateUniqueFilename } from '../utils/fileHelper.js';
import { ERROR_MESSAGES } from '../constants/messages.constants.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = UPLOAD_DIRECTORIES.BASE;
    if (req.baseUrl.includes('news')) {
      uploadPath = UPLOAD_DIRECTORIES.NEWS;
    } else if (req.baseUrl.includes('products')) {
      uploadPath = UPLOAD_DIRECTORIES.PRODUCTS;
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, generateUniqueFilename(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: fileFilter,
});`,
  'src/startup/init.js': `import { UPLOAD_DIRECTORIES } from '../constants/upload.constants.js';
import { createDirectoryIfNotExistsSync } from '../utils/fileHelper.js';

export const initializeApp = () => {
  process.env.TZ = 'Asia/Jakarta';
  
  Object.values(UPLOAD_DIRECTORIES).forEach((dir) => {
    createDirectoryIfNotExistsSync(dir);
  });
  
  console.log('Application initialized successfully.');
};`,
  'src/app.js': `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';

import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { initializeApp } from './startup/init.js';

initializeApp();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

const API_PREFIX = '/api/v1';

app.use(notFoundHandler);

app.use(errorHandler);

export default app;`,
  'src/server.js': `import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import './config/db.config.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(\`Server is running in \${process.env.NODE_ENV || 'development'} mode on port \${PORT}\`);
});`,
  'README.md': `# Website Profil Desa Cipicung - Backend API (MVP)

This is the MVP backend API for the official Village Profile Website of Desa Cipicung.

## Folder Structure
\`\`\`text
src/
├── config/       # Database config
├── constants/    # Magic strings
├── controllers/  # Request handlers
├── database/     # DB schema and seeds (Phase 2)
├── middlewares/  # Express middlewares
├── repositories/ # Database interactions
├── routes/       # API routing
├── services/     # Business logic
├── startup/      # Initialization scripts
├── utils/        # Shared helper functions
├── validators/   # Request validation rules
├── app.js        # Express app
└── server.js     # Entry point
\`\`\`

## Installation
\`\`\`bash
npm install
cp .env.example .env
\`\`\`

## Testing Endpoints
- **Health Check**: \`GET /health\`
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(baseDir, filePath);
  const dirPath = path.dirname(fullPath);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(\`Created \${filePath}\`);
}

// Create empty directories that might not have files yet
const emptyDirs = [
  'src/controllers',
  'src/database',
  'src/repositories',
  'src/routes',
  'src/services',
  'src/validators'
];

for (const dir of emptyDirs) {
  const dirPath = path.join(baseDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(\`Created \${dir}\`);
  }
}

console.log('Project setup complete.');
