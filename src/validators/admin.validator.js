import { query, body, param } from 'express-validator';

export const getAdminsValidator = [
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
    .isIn(['newest', 'oldest', 'username', 'full_name'])
    .withMessage('Sort must be either newest, oldest, username, or full_name')
];

export const getAdminByIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid administrator ID format')
];

export const createAdminValidator = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Username cannot exceed 100 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('full_name')
    .notEmpty()
    .withMessage('Full name is required')
    .isString()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Full name cannot exceed 150 characters'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['PROFILE_ADMIN', 'MARKETING_ADMIN'])
    .withMessage('Role must be either PROFILE_ADMIN or MARKETING_ADMIN')
];

export const deleteAdminValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid administrator ID format')
];
