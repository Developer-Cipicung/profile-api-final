import * as newsRepo from '../repositories/news.repository.js';
import { getPaginationData, getOffset } from '../utils/pagination.js';
import { uploadImage, deleteImage, getPublicUrl } from './storage.service.js';
import { generateUniqueFilename } from '../utils/fileHelper.js';
import fs from 'fs';
import path from 'path';

const uploadDefaultImage = async (prefix) => {
  const defaultImagePath = path.join(process.cwd(), 'uploads', 'default-image.png');
  if (fs.existsSync(defaultImagePath)) {
    const buffer = fs.readFileSync(defaultImagePath);
    const key = `${prefix}/${generateUniqueFilename('default-image.png')}`;
    await uploadImage(buffer, 'image/png', key);
    return key;
  }
  return null;
};

const processThumbnail = (news) => {
  if (!news) return news;
  if (news.thumbnail_url) {
    news.thumbnail_url = getPublicUrl(news.thumbnail_url);
  } else {
    news.thumbnail_url = getPublicUrl(process.env.DEFAULT_NEWS_IMAGE);
  }
  return news;
};

export const getNews = async ({ page, limit, search, sort }) => {
  const offset = getOffset(page, limit);
  const totalItems = await newsRepo.countNews(search);
  
  const newsList = await newsRepo.getNews(limit || 10, offset, search, sort || 'newest');
  
  const processedData = newsList.map(processThumbnail);
  const pagination = getPaginationData(page, limit, totalItems);
  
  return { data: processedData, pagination };
};

export const getNewsById = async (id) => {
  const news = await newsRepo.getNewsById(id);
  if (!news) {
    const error = new Error('News not found');
    error.statusCode = 404;
    throw error;
  }
  return processThumbnail(news);
};

export const createNews = async (data, file) => {
  let thumbnailKey = null;
  if (file) {
    thumbnailKey = `news/${generateUniqueFilename(file.originalname)}`;
    await uploadImage(file.buffer, file.mimetype, thumbnailKey);
  } else {
    thumbnailKey = await uploadDefaultImage('news');
  }

  try {
    const news = await newsRepo.createNews({
      title: data.title,
      content: data.content,
      created_at: data.created_at ? (data.created_at instanceof Date ? data.created_at.toISOString() : data.created_at) : undefined,
      thumbnail_url: thumbnailKey
    });
    return processThumbnail(news);
  } catch (error) {
    if (thumbnailKey) {
      await deleteImage(thumbnailKey);
    }
    throw error;
  }
};

export const updateNews = async (id, data, file) => {
  let newThumbnailKey = undefined;
  
  if (file) {
    newThumbnailKey = `news/${generateUniqueFilename(file.originalname)}`;
    await uploadImage(file.buffer, file.mimetype, newThumbnailKey);
  } else if (data.remove_thumbnail === 'true') {
    newThumbnailKey = await uploadDefaultImage('news');
  }

  try {
    const existingNews = await newsRepo.getNewsById(id);
    if (!existingNews) {
      const error = new Error('News not found');
      error.statusCode = 404;
      throw error;
    }

    const updatedNews = await newsRepo.updateNews(id, {
      title: data.title,
      content: data.content,
      created_at: data.created_at ? (data.created_at instanceof Date ? data.created_at.toISOString() : data.created_at) : undefined,
      thumbnail_url: newThumbnailKey
    });

    if (newThumbnailKey && existingNews.thumbnail_url) {
       await deleteImage(existingNews.thumbnail_url);
    }
    
    return processThumbnail(updatedNews);
  } catch (error) {
    if (newThumbnailKey) {
      await deleteImage(newThumbnailKey);
    }
    throw error;
  }
};

export const deleteNews = async (id) => {
  const existingNews = await newsRepo.getNewsById(id);
  if (!existingNews) {
    const error = new Error('News not found');
    error.statusCode = 404;
    throw error;
  }

  const deletedNews = await newsRepo.deleteNews(id);
  
  if (deletedNews && deletedNews.thumbnail_url) {
    await deleteImage(deletedNews.thumbnail_url);
  }
};
