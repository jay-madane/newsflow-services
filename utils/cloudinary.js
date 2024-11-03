import { v2 as cloudinary } from "cloudinary";

// configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (fileBuffer) => {
    try {
        if(!fileBuffer) return null;

        // upload file on cloudinary
        const uploadResult = await cloudinary.uploader.upload_stream({
            resource_type: "auto"
        }, (error, result)=>{
            if(error) throw error;
            return result;
        });

        const stream = cloudinary.uploader.upload_stream();
        stream.end(fileBuffer);

        return uploadResult;
    } catch (error) {
        console.error("Cloudinary upload error: ", error);
        return null;
    }
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

export { uploadOnCloudinary, deleteOnCloudinary };