import * as newsRepo from '../repositories/news.repository.js';
import { getPaginationData, getOffset } from '../utils/pagination.js';
import { uploadImage, deleteImage, getPublicUrl } from './storage.service.js';
import { generateUniqueFilename } from '../utils/fileHelper.js';
import { sanitizeArticleContent } from '../utils/sanitizer.js';
import { extractBodyImageKeys } from '../utils/htmlParser.js';
import fs from 'fs';
import path from 'path';

export const uploadBodyImage = async (file) => {
  const bodyKey = `news/body-${generateUniqueFilename(file.originalname)}`;
  await uploadImage(file.buffer, file.mimetype, bodyKey);
  return {
    url: getPublicUrl(bodyKey),
    key: bodyKey
  };
};

export const cleanupBodyImages = async (keys) => {
  if (!Array.isArray(keys)) return;
  for (const key of keys) {
    if (key && key.startsWith('news/body-')) {
      try {
        const isUsed = await newsRepo.isImageUsed(key);
        if (!isUsed) {
          await deleteImage(key);
        }
      } catch (err) {
        console.error(`Failed to cleanup image ${key}:`, err);
      }
    }
  }
};

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
    const sanitizedContent = sanitizeArticleContent(data.content);
    
    const news = await newsRepo.createNews({
      title: data.title,
      content: sanitizedContent,
      created_at: data.created_at ? (data.created_at instanceof Date ? data.created_at.toISOString() : data.created_at) : undefined,
      thumbnail_url: thumbnailKey
    });

    // Safe cleanup of orphans created during this session
    if (data.uploaded_images && typeof data.uploaded_images === 'string') {
      try {
        const uploadedImages = JSON.parse(data.uploaded_images);
        const contentImageKeys = extractBodyImageKeys(sanitizedContent);
        const orphanedKeys = uploadedImages.filter(key => !contentImageKeys.includes(key));
        await cleanupBodyImages(orphanedKeys);
      } catch (err) {
        console.error('Failed to parse and cleanup uploaded_images in createNews:', err);
      }
    }

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

    const sanitizedContent = sanitizeArticleContent(data.content);

    const updatedNews = await newsRepo.updateNews(id, {
      title: data.title,
      content: sanitizedContent,
      created_at: data.created_at ? (data.created_at instanceof Date ? data.created_at.toISOString() : data.created_at) : undefined,
      thumbnail_url: newThumbnailKey
    });

    if (newThumbnailKey && existingNews.thumbnail_url) {
       await deleteImage(existingNews.thumbnail_url);
    }
    
    // Cleanup orphaned body images safely
    try {
      const oldImageKeys = extractBodyImageKeys(existingNews.content);
      const newImageKeys = extractBodyImageKeys(sanitizedContent);
      
      let allPotentialOrphans = [...oldImageKeys];
      
      if (data.uploaded_images && typeof data.uploaded_images === 'string') {
        const uploadedImages = JSON.parse(data.uploaded_images);
        allPotentialOrphans = [...allPotentialOrphans, ...uploadedImages];
      }
      
      const orphanedKeys = allPotentialOrphans.filter(key => !newImageKeys.includes(key));
      
      // We directly delete old keys that were removed, but for newly uploaded keys 
      // we must verify they are actually not used anywhere else (IDOR protection).
      // cleanupBodyImages already does this safe check for everything.
      await cleanupBodyImages(orphanedKeys);
    } catch (cleanupError) {
      console.error('Failed to cleanup orphaned body images:', cleanupError);
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
  
  // Clean up all body images
  try {
    const bodyImageKeys = extractBodyImageKeys(existingNews.content);
    for (const key of bodyImageKeys) {
      await deleteImage(key);
    }
  } catch (cleanupError) {
    console.error('Failed to cleanup body images during news deletion:', cleanupError);
  }
};
