import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = connection.connections[0].readyState === 1;
    console.log("MongoDB connected successfully");
    return connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

export default connectDB;
