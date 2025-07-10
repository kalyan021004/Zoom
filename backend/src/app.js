import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import dotenv from "dotenv";

import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the backend directory (one level up from src)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debug: Check what's loaded
console.log('=== Environment Variables Debug ===');
console.log('Current working directory:', process.cwd());
console.log('Looking for .env at:', path.join(__dirname, '../.env'));
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Not found');
console.log('================================');

// Now access environment variables after dotenv.config()
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 8000;

const app = express();
const server = createServer(app);

// Connect socket server
const io = connectToSocket(server);

// Middleware
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Routes
app.use("/api/v1/users", userRoutes);

const start = async () => {
    try {
        // Add validation for MONGO_URI
        if (!MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables. Please check your .env file.');
        }

        console.log('Attempting to connect to MongoDB...');
        const connectionDb = await mongoose.connect(MONGO_URI);
        console.log(`✅ MongoDB connected: ${connectionDb.connection.host}`);

        server.listen(PORT, () => {
            console.log(`🚀 Server listening on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to connect to MongoDB", err);
        process.exit(1);
    }
};

start();