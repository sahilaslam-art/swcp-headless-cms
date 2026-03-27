import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const resetDb = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/sahil-portfolio";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");
    
    await mongoose.connection.db.dropDatabase();
    console.log("Database successfully dropped!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error resetting DB:", error);
    process.exit(1);
  }
};

resetDb();
