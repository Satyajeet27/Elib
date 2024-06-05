import mongoose from "mongoose";

const connectDb = async (uri: string) => {
  try {
    await mongoose.connect(uri);
    console.log("Database connected");
  } catch (error) {
    console.log("Error in connecting database");
    process.exit(1);
  }
};
export default connectDb;
