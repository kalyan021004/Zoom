// server.js or index.js
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

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

// Set port from .env
const PORT = process.env.PORT || 8000;

// Mongo URI
const MONGO_URI = process.env.MONGO_URI;

const start = async () => {
    try {
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
