import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import env from '../config/env.js';

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key:    env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
});

const uploadBuffer = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        stream.end(buffer);
    });
};

export const uploadSignature = async (fileBuffer) => {
    if (process.env.NODE_ENV === 'test') return 'https://test.cloudinary.com/signature.webp';
    const optimized = await sharp(fileBuffer)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

    const result = await uploadBuffer(optimized, {
        folder:    'bildyapp/signatures',
        resource_type: 'image',
        format:    'webp'
    });

    return result.secure_url;
};

export const uploadLogo = async (fileBuffer) => {
    if (process.env.NODE_ENV === 'test') return 'https://test.cloudinary.com/logo.webp';
    const optimized = await sharp(fileBuffer)
        .resize({ width: 400, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

    const result = await uploadBuffer(optimized, {
        folder:    'bildyapp/logos',
        resource_type: 'image',
        format:    'webp'
    });

    return result.secure_url;
};

export const uploadPdf = async (pdfBuffer) => {
    if (process.env.NODE_ENV === 'test') return 'https://test.cloudinary.com/albaran.pdf';
    const result = await uploadBuffer(pdfBuffer, {
        folder:        'bildyapp/pdfs',
        resource_type: 'raw',
        format:        'pdf'
    });

    return result.secure_url;
};

export const deleteFile = async (url) => {
    const parts = url.split('/');
    const filenameWithExt = parts[parts.length - 1];
    const filename = filenameWithExt.split('.')[0];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${filename}`;

    await cloudinary.uploader.destroy(publicId);
};
