import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

console.log("Cloudinary Key:", process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING");

cloudinary.config({
    cloud_name: "dm5kiejzk",
    api_key: "927388969168581",
    api_secret: "9Cd0mySTGLUtZcB0y2SfjeVsuxES"
});

const storage = multer.memoryStorage();

export const uploadWork = multer({ storage });
export { cloudinary };