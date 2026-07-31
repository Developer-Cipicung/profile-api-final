import * as productRepo from '../repositories/product.repository.js';
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

const processImage = (product) => {
  if (!product) return product;
  if (product.image_url) {
    product.image_url = getPublicUrl(product.image_url);
  } else {
    product.image_url = getPublicUrl(process.env.DEFAULT_PRODUCT_IMAGE);
  }
  return product;
};

export const getProducts = async ({ page, limit, search, sort }) => {
  const offset = getOffset(page, limit);
  const totalItems = await productRepo.countProducts(search);
  
  const productList = await productRepo.getProducts(limit || 12, offset, search, sort || 'newest');
  
  const processedData = productList.map(processImage);
  const pagination = getPaginationData(page, limit, totalItems);
  
  return { data: processedData, pagination };
};

export const getProductById = async (id) => {
  const product = await productRepo.getProductById(id);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
  return processImage(product);
};

export const createProduct = async (data, file) => {
  let imageKey = null;
  if (file) {
    imageKey = `products/${generateUniqueFilename(file.originalname)}`;
    await uploadImage(file.buffer, file.mimetype, imageKey);
  } else {
    imageKey = await uploadDefaultImage('products');
  }

  try {
    const product = await productRepo.createProduct({
      name: data.name,
      description: data.description,
      price: parseInt(data.price, 10),
      no_telp: data.no_telp || null,
      image_url: imageKey
    });
    return processImage(product);
  } catch (error) {
    if (imageKey) {
      await deleteImage(imageKey);
    }
    throw error;
  }
};

export const updateProduct = async (id, data, file) => {
  let newImageKey = undefined;
  
  if (file) {
    newImageKey = `products/${generateUniqueFilename(file.originalname)}`;
    await uploadImage(file.buffer, file.mimetype, newImageKey);
  } else if (data.remove_image === 'true') {
    newImageKey = await uploadDefaultImage('products');
  }

  try {
    const existingProduct = await productRepo.getProductById(id);
    if (!existingProduct) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    const updatedProduct = await productRepo.updateProduct(id, {
      name: data.name,
      description: data.description,
      price: data.price ? parseInt(data.price, 10) : undefined,
      no_telp: data.no_telp,
      image_url: newImageKey
    });

    if (newImageKey && existingProduct.image_url) {
       await deleteImage(existingProduct.image_url);
    }
    
    return processImage(updatedProduct);
  } catch (error) {
    if (newImageKey) {
      await deleteImage(newImageKey);
    }
    throw error;
  }
};

export const deleteProduct = async (id) => {
  const existingProduct = await productRepo.getProductById(id);
  if (!existingProduct) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const deletedProduct = await productRepo.deleteProduct(id);
  
  if (deletedProduct && deletedProduct.image_url) {
    await deleteImage(deletedProduct.image_url);
  }
};
