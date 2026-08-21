import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/db.js";
import mongoose from "mongoose";
import redis from "./config/redis.js";
import { validateEnv } from "./config/env.js";

const env = validateEnv(process.env);
const PORT = env.PORT;

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`app is listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection error", err);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Closing server...`);

  // Stop accepting new connections
  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log("Server Closed.")
    }

    await mongoose.connection.close();
    console.log("MongoDB connection closed.");

    // Close Redis
    await redis.quit();
    console.log("Redis connection closed.");

    console.log("Graceful shutdown completed.");
    
    process.exit(0);
  } catch (error) {
    console.log("Error during graceful Shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();

// connectDB()
//   .then(() => {
//     app.listen(port, () => {
//       console.log(`app is listenting on http://localhost:${port}`);
//     });
//   })
//   .catch((err) => {
//     console.error("MongoDB connection error", err);
//     process.exit(1);
//   });
