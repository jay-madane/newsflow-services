import { v2 as cloudinary } from "cloudinary";

// configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (fileBuffer) => {
    return new Promise((resolve, reject) => {
        // start the cloudinary upload stream
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        stream.end(fileBuffer);
    });
}

const deleteOnCloudinary = async (publicId) => {
    try {
        const deleteResult = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image"
        });
        return deleteResult;
    } catch (error) {
        console.error("Cloudinary deletion error: ", error);
        return null;
    }
}

const getPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    return parts[parts.length - 1].split('.')[0];
};

export { uploadOnCloudinary, deleteOnCloudinary, getPublicIdFromUrl };