import fs from 'fs';
import path from 'path';
import { uploadImage } from './src/services/storage.service.js';

async function uploadDefaults() {
  const newsPath = path.resolve('uploads/default-news.png');
  const productPath = path.resolve('uploads/default-product.png');
  
  try {
    if (fs.existsSync(newsPath)) {
      const newsBuffer = fs.readFileSync(newsPath);
      await uploadImage(newsBuffer, 'image/png', 'default-news.png');
      console.log('Successfully uploaded default-news.png to R2');
    }
    
    if (fs.existsSync(productPath)) {
      const productBuffer = fs.readFileSync(productPath);
      await uploadImage(productBuffer, 'image/png', 'default-product.png');
      console.log('Successfully uploaded default-product.png to R2');
    }
  } catch (error) {
    console.error('Failed to upload defaults:', error);
  }
}

uploadDefaults();
