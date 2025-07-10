import { Router } from "express";
import { addToHistory, getUserHistory, login, register } from "../controllers/user.controller.js";

console.log("=== USER ROUTES FILE LOADED ===");

const router = Router();

// Test route
router.get("/test", (req, res) => {
    console.log("Test route hit");
    res.json({ message: "User routes working!" });
});

// Database-powered routes
router.post("/register", register);
router.post("/login", login);
router.get("/get_all_activity", getUserHistory);
router.post("/add_to_activity", addToHistory);

console.log("=== ROUTES DEFINED ===");
console.log("Routes stack length:", router.stack.length);
router.stack.forEach((layer, index) => {
    if (layer.route) {
        console.log(`Route ${index}: ${Object.keys(layer.route.methods).join(', ').toUpperCase()} ${layer.route.path}`);
    }
});

export default router;