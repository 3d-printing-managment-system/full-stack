// lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file: Express.Multer.File) => {
  return new Promise<{ fileUrl: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "novaforma/files",
        public_id: file.originalname, // 👈 preserves filename + extension
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary error:", error); // 👈 log it
          return reject(error);
        }
        resolve({ fileUrl: result!.secure_url });
      },
    );
    stream.end(file.buffer);
  });
};
