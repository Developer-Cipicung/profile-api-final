import { query, body, param } from 'express-validator';

const isShopeeUrl = (value) => {
  try {
    const url = new URL(value);
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
    const isShopee = url.hostname === 'shopee.co.id' || url.hostname.endsWith('.shopee.co.id');
    return isHttp && isShopee;
  } catch {
    return false;
  }
};

export const getProductsValidator = [
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
    .isIn(['newest', 'oldest', 'name', 'price'])
    .withMessage('Sort must be either newest, oldest, name, or price')
];

export const getProductByIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid product ID format')
];

export const createProductValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Name cannot exceed 255 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isInt({ gt: 0 })
    .withMessage('Price must be a positive integer'),
  body('no_telp')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('shopee_url')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Shopee URL cannot exceed 500 characters')
    .custom(isShopeeUrl)
    .withMessage('Shopee URL must use shopee.co.id')
];

export const updateProductValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid product ID format'),
  body('name')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty if provided')
    .isLength({ max: 255 })
    .withMessage('Name cannot exceed 255 characters'),
  body('description')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty if provided')
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters'),
  body('price')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('Price must be a positive integer if provided'),
  body('no_telp')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('shopee_url')
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Shopee URL cannot exceed 500 characters')
    .custom(isShopeeUrl)
    .withMessage('Shopee URL must use shopee.co.id'),
  body().custom((value, { req }) => {
    if (!req.body.name && !req.body.description && !req.body.price && !req.body.no_telp && req.body.shopee_url === undefined && !req.file) {
      throw new Error('At least one field (name, description, price, no_telp, shopee_url, or image) must be provided for update');
    }
    return true;
  })
];

export const deleteProductValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid product ID format')
];
