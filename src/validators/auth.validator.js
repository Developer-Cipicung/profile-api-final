import { body } from 'express-validator';

export const loginValidator = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isString()
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isString()
];
