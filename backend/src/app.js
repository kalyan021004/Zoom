import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js"

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

// Manual route registration (for testing)
app.post("/api/v1/users/test-direct", (req, res) => {
    res.json({ message: "Direct route working!", body: req.body });
});
app.use("/api/v1/users",userRoutes);

// Try to import routes
console.log("=== ATTEMPTING TO IMPORT ROUTES ===");
try {
    const userRoutes = await import("./routes/users.routes.js");
    console.log("Routes imported successfully:");
    console.log("userRoutes:", userRoutes);
    console.log("userRoutes.default:", userRoutes.default);
    console.log("Type of userRoutes.default:", typeof userRoutes.default);
    
    if (userRoutes.default) {
        console.log("Using userRoutes.default");
        app.use("/api/v1/users", userRoutes.default);
        console.log("Routes registered at /api/v1/users");
    } else {
        console.log("No default export found");
    }
} catch (error) {
    console.error("Error importing routes:", error);
}

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
        url: req.originalUrl
    });
});

const start = async () => {
    try {
        const connectionDb = await mongoose.connect("mongodb+srv://kalyan021004:7HDhL2JSBKvYO9R3@zoom-clone.d5gsu61.mongodb.net/?retryWrites=true&w=majority&appName=Zoom-clone");
        console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);
        
        server.listen(app.get("port"), () => {
            console.log(`Server listening on port ${app.get("port")}`);
            console.log(`Test server: http://localhost:${app.get("port")}/test`);
            console.log(`Test direct route: http://localhost:${app.get("port")}/api/v1/users/test-direct`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
    }
};

start();