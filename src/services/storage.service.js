import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../config/storage.js';

/**
 * Uploads an image buffer to R2
 * @param {Buffer} buffer The file buffer
 * @param {string} mimetype The MIME type of the file
 * @param {string} key The full key (e.g. news/uuid-timestamp.png)
 * @returns {Promise<string>} The uploaded key
 */
export const uploadImage = async (buffer, mimetype, key) => {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  });

  await s3Client.send(command);
  return key;
};

/**
 * Deletes an image from R2 by key
 * @param {string} key The object key
 */
export const deleteImage = async (key) => {
  if (!key) return;

  const extractedKey = extractKey(key);
  if (!extractedKey) return;

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: extractedKey,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error(`Failed to delete object in R2: ${extractedKey}`, error);
  }
};

/**
 * Fetches an image stream from R2 (used for the proxy route)
 * @param {string} key The object key
 * @returns {Promise<{ stream: any, contentType: string }>}
 */
export const getImageStream = async (key) => {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });
  
  const response = await s3Client.send(command);
  return { stream: response.Body, contentType: response.ContentType };
};

/**
 * Gets the absolute public URL for an R2 key or falls back to the proxy route
 * @param {string} key The object key
 * @returns {string|null} The public URL or proxy path
 */
export const getPublicUrl = (key) => {
  if (!key) return null;
  // If it's already a full HTTP URL (e.g. external links or already formatted), return it
  if (key.startsWith('http://') || key.startsWith('https://')) return key;
  
  // Clean up leading slashes if they somehow got stored
  const cleanKey = key.startsWith('/') ? key.substring(1) : key;
  
  // If a public URL is configured in .env, use it
  if (R2_PUBLIC_URL) {
    const baseUrl = R2_PUBLIC_URL.endsWith('/') ? R2_PUBLIC_URL : `${R2_PUBLIC_URL}/`;
    return `${baseUrl}${cleanKey}`;
  }
  
  // Fallback: Use our backend proxy route
  return `/api/v1/images/${cleanKey}`;
};

/**
 * Extracts the object key from a full URL or legacy path
 * @param {string} urlOrKey The full URL, legacy path, or key
 * @returns {string} The extracted object key
 */
export const extractKey = (urlOrKey) => {
  if (!urlOrKey) return null;
  
  // Handle full R2 public URLs
  if (R2_PUBLIC_URL && urlOrKey.startsWith(R2_PUBLIC_URL)) {
    const baseUrl = R2_PUBLIC_URL.endsWith('/') ? R2_PUBLIC_URL : `${R2_PUBLIC_URL}/`;
    return urlOrKey.replace(baseUrl, '');
  }

  // Handle legacy local uploads path (e.g. /uploads/news/image.png -> news/image.png)
  if (urlOrKey.startsWith('/uploads/')) {
    return urlOrKey.replace('/uploads/', '');
  }
  
  if (urlOrKey.startsWith('uploads/')) {
    return urlOrKey.replace('uploads/', '');
  }

  // Already a relative key
  return urlOrKey.startsWith('/') ? urlOrKey.substring(1) : urlOrKey;
};
