import * as newsService from '../services/news.service.js';
import { HTTP_STATUS } from '../constants/httpStatus.constants.js';
import { SUCCESS_MESSAGES } from '../constants/messages.constants.js';
import { successResponse } from '../utils/response.js';

import { convertRelativeImagesToAbsolute } from '../utils/htmlParser.js';

export const getNews = async (req, res) => {
  const { page, limit, search, sort } = req.query;
  const result = await newsService.getNews({ page, limit, search, sort });
  
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  result.data = result.data.map(news => ({
    ...news,
    thumbnail_url: news.thumbnail_url?.startsWith('/') ? `${baseUrl}${news.thumbnail_url}` : news.thumbnail_url,
    content: convertRelativeImagesToAbsolute(news.content, baseUrl)
  }));
  
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
  
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  news.thumbnail_url = news.thumbnail_url?.startsWith('/') ? `${baseUrl}${news.thumbnail_url}` : news.thumbnail_url;
  news.content = convertRelativeImagesToAbsolute(news.content, baseUrl);
  
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

export const uploadBodyImage = async (req, res) => {
  const file = req.file;
  
  if (!file) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Image file is required',
    });
  }

  const result = await newsService.uploadBodyImage(file);
  
  return successResponse(
    res,
    HTTP_STATUS.CREATED,
    SUCCESS_MESSAGES.CREATED,
    result
  );
};

export const cleanupBodyImages = async (req, res) => {
  const { keys } = req.body;
  if (Array.isArray(keys) && keys.length > 0) {
    // Fire and forget cleanup
    newsService.cleanupBodyImages(keys).catch(err => console.error('Background cleanup failed', err));
  }
  
  return successResponse(
    res,
    HTTP_STATUS.OK,
    SUCCESS_MESSAGES.DELETED
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
