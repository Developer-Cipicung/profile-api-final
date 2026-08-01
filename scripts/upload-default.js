import fs from 'fs';
import path from 'path';
import { uploadImage } from '../src/services/storage.service.js';

const uploadDefault = async () => {
  const filePath = path.join(process.cwd(), 'uploads', 'default-image.png');
  const buffer = fs.readFileSync(filePath);
  
  console.log("Uploading default-image.png...");
  await uploadImage(buffer, 'image/png', 'default-image.png');
  console.log("Upload successful!");
  process.exit(0);
};

uploadDefault().catch(console.error);
