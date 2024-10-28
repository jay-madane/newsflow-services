import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        // upload file on cloudinary
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        fs.unlinkSync(localFilePath);
        return uploadResult;

    } catch (error) {
        console.error("Cloudinary upload error: ", error);
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteOnCloudinary = async (localFilePath) => {
    try {
        const deleteResult = await cloudinary.uploader.destroy(localFilePath, {
            resource_type: "auto"
        });
    } catch (error) {
        console.error("Cloudinary deletion error: ", error);
        return null;
    }
}

export { uploadOnCloudinary, deleteOnCloudinary };