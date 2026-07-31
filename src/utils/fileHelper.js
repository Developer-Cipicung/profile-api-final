import path from 'path';
import crypto from 'crypto';

export const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  return `${uuid}-${timestamp}${ext}`;
};
