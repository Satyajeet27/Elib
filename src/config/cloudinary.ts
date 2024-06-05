import cloudinary from "cloudinary";
import { config } from "./config";

cloudinary.v2.config({
  cloud_name: config.cloudinary_cloud,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

export default cloudinary;
