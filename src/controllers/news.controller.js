import * as newsService from '../services/news.service.js';
import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
import { SUCCESS_MESSAGES } from '../constants/messages.constants.js';
import { successResponse } from '../utils/response.js';

export const getNews = async (req, res) => {
  const { page, limit, search, sort } = req.query;
  const result = await newsService.getNews({ page, limit, search, sort });
  
  return successResponse(
    res,
    HTTP_STATUS.OK,
    SUCCESS_MESSAGES.FETCHED,
    result.data,
    result.pagination
  );
};

export const getNewsById = async (req, res) => {
  const { id } = req.params;
  const news = await newsService.getNewsById(id);
  
  return successResponse(
    res,
    HTTP_STATUS.OK,
    SUCCESS_MESSAGES.FETCHED,
    news
  );
};

export const createNews = async (req, res) => {
  const data = req.body;
  const file = req.file;
  
  const news = await newsService.createNews(data, file);
  
  return successResponse(
    res,
    HTTP_STATUS.CREATED,
    SUCCESS_MESSAGES.CREATED,
    news
  );
};

export const updateNews = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const file = req.file;
  
  const news = await newsService.updateNews(id, data, file);
  
  return successResponse(
    res,
    HTTP_STATUS.OK,
    SUCCESS_MESSAGES.UPDATED,
    news
  );
};

export const deleteNews = async (req, res) => {
  const { id } = req.params;
  
  await newsService.deleteNews(id);
  
  return successResponse(
    res,
    HTTP_STATUS.OK,
    SUCCESS_MESSAGES.DELETED
  );
};
