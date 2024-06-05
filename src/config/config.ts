import dotenv from "dotenv";

dotenv.config();

const _config = {
  port: process.env.PORT,
  uri: process.env.MONGO_CONNECTION_STRING,
  node_env: process.env.NODE_ENV,
  jwt_secret_key: process.env.JWT_SECRET,
  cloudinary_cloud: process.env.CLOUDINARY_CLOUD,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
};

export const config = Object.freeze(_config);
