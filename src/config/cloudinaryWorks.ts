import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

console.log("Cloudinary Key:", process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
    
});
console.log("Cloudinary Key:", process.env.CLOUDINARY_API_KEY);
console.log("Cloudinary Secret:", process.env.CLOUDINARY_API_SECRET?.slice(0, 5) + "...");
console.log("Cloudinary Cloud:", process.env.CLOUDINARY_CLOUD_NAME);
const storage = multer.memoryStorage();

export const uploadWork = multer({ storage });
export { cloudinary };