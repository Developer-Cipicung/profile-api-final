import * as productService from '../services/product.service.js';
import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
import { SUCCESS_MESSAGES } from '../constants/messages.constants.js';
import { successResponse } from '../utils/response.js';

export const getProducts = async (req, res) => {
  const { page, limit, search, sort } = req.query;
  const result = await productService.getProducts({ page, limit, search, sort });
  
  return successResponse(
    res,
    HTTP_STATUS.OK,
    SUCCESS_MESSAGES.FETCHED,
    result.data,
    result.pagination
  );
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  const product = await productService.getProductById(id);
  
  return successResponse(
    res,
    HTTP_STATUS.OK,
    SUCCESS_MESSAGES.FETCHED,
    product
  );
};

export const createProduct = async (req, res) => {
  const data = req.body;
  const file = req.file;
  
  const product = await productService.createProduct(data, file);
  
  return successResponse(
    res,
    HTTP_STATUS.CREATED,
    SUCCESS_MESSAGES.CREATED,
    product
  );
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const file = req.file;
  
  const product = await productService.updateProduct(id, data, file);
  
  return successResponse(
    res,
    HTTP_STATUS.OK,
    SUCCESS_MESSAGES.UPDATED,
    product
  );
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  
  await productService.deleteProduct(id);
  
  return successResponse(
    res,
    HTTP_STATUS.OK,
    SUCCESS_MESSAGES.DELETED
  );
};
