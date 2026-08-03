import { query, body, param } from 'express-validator';

export const getNewsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer between 1 and 100'),
  query('search')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Search query cannot be empty'),
  query('sort')
    .optional()
    .isIn(['newest', 'oldest'])
    .withMessage('Sort must be either newest or oldest')
];

export const getNewsByIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid news ID format')
];

export const createNewsValidator = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Title cannot exceed 255 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isString()
    .trim(),
  body('created_at')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('created_at must be a valid ISO 8601 date string')
];

export const updateNewsValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid news ID format'),
  body('title')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty if provided')
    .isLength({ max: 255 })
    .withMessage('Title cannot exceed 255 characters'),
  body('content')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty if provided'),
  body('created_at')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('created_at must be a valid ISO 8601 date string'),
  body().custom((value, { req }) => {
    if (!req.body.title && !req.body.content && !req.body.created_at && !req.file && !req.body.remove_thumbnail) {
      throw new Error('At least one field (title, content, created_at, or image) must be provided for update');
    }
    return true;
  })
];

export const deleteNewsValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid news ID format')
];
