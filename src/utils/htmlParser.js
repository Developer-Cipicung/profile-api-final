import { extractKey } from '../services/storage.service.js';

/**
 * Extracts object keys from image src attributes inside an HTML string.
 * It filters for keys that belong to the 'news/body-' namespace.
 */
export const extractBodyImageKeys = (html) => {
  if (!html) return [];
  
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  const keys = new Set();
  let match;
  
  while ((match = imgRegex.exec(html)) !== null) {
    const rawUrl = match[1];
    const key = extractKey(rawUrl);
    
    // Only track our body images
    if (key && key.startsWith('news/body-')) {
      keys.add(key);
    }
  }
  
  return Array.from(keys);
};

/**
 * Converts relative image URLs in HTML content to absolute URLs using the provided base URL.
 */
export const convertRelativeImagesToAbsolute = (html, baseUrl) => {
  if (!html || !baseUrl) return html;
  // This matches src="/api/v1/images/..." and prepends baseUrl
  return html.replace(/src="(\/api\/v1\/images\/[^"]+)"/g, `src="${baseUrl}$1"`);
};
