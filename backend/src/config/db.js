import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );
    console.log("MongoDB connected successfully");
  }catch (error) {
  console.error("MongoDB connection failed:", error.message);
  for (const [addr, server] of error.reason?.servers ?? []) {
    console.error(addr, "=>", server.error?.message);
  }
  process.exit(1);
}
};
