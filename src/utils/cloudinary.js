import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloludinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const res = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type: "auto"
            })
        // file has been uploaded succesfully
        // console.log("file is uploaded on cloudinary", res.url);
        fs.unlinkSync(localFilePath)
        return res
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally save temporary file as the upload operatioin got failed
        return null
    }
}
export { uploadOnCloludinary }

//   cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function(error, result) {console.log(result); });