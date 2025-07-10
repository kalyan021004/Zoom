import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Test route
app.get("/test", (req, res) => {
    res.json({ message: "Server is working!" });
});

// Routes registration
console.log("=== REGISTERING ROUTES ===");
console.log("userRoutes:", typeof userRoutes);
app.use("/api/v1/users", userRoutes);

// List all registered routes
console.log("\n=== REGISTERED ROUTES ===");
app._router.stack.forEach((middleware, index) => {
    if (middleware.route) {
        // Direct route
        console.log(`${index}: ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
        // Router middleware
        console.log(`${index}: Router middleware`);
        if (middleware.handle && middleware.handle.stack) {
            middleware.handle.stack.forEach((handler, handlerIndex) => {
                if (handler.route) {
                    console.log(`  ${handlerIndex}: ${Object.keys(handler.route.methods).join(', ').toUpperCase()} ${handler.route.path}`);
                }
            });
        }
    } else {
        console.log(`${index}: ${middleware.name || 'Anonymous'} middleware`);
    }
});

// 404 handler
app.use('*', (req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        message: 'Route not found',
        method: req.method,
        url: req.originalUrl,
        availableRoutes: [
            'GET /test',
            'POST /api/v1/users/login',
            'POST /api/v1/users/register'
        ]
    });
});

const start = async () => {
    try {
        const connectionDb = await mongoose.connect("mongodb+srv://kalyan021004:7HDhL2JSBKvYO9R3@zoom-clone.d5gsu61.mongodb.net/?retryWrites=true&w=majority&appName=Zoom-clone");
        console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);
        
        server.listen(app.get("port"), () => {
            console.log(`Server listening on port ${app.get("port")}`);
            console.log(`Test server: http://localhost:${app.get("port")}/test`);
            console.log(`API base URL: http://localhost:${app.get("port")}/api/v1/users`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
    }
};

start();