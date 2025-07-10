import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

const login = async (req, res) => {
    console.log("=== LOGIN DEBUG ===");
    console.log("Request body:", req.body);
    
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please provide username and password" });
    }

    try {
        console.log("Looking for user:", username);
        
        // Find user by username
        const user = await User.findOne({ username });
        console.log("User found:", user ? "Yes" : "No");
        
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        console.log("User data:", {
            id: user._id,
            name: user.name,
            username: user.username,
            hasPassword: !!user.password,
            passwordLength: user.password ? user.password.length : 0
        });

        // Compare password
        console.log("Comparing passwords:");
        console.log("Input password:", password);
        console.log("Stored password hash:", user.password);
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        console.log("Password comparison result:", isPasswordCorrect);

        if (isPasswordCorrect) {
            // Generate token
            const token = crypto.randomBytes(20).toString("hex");
            console.log("Generated token:", token);

            // Save token to user
            user.token = token;
            await user.save();
            
            console.log("Login successful for user:", username);
            return res.status(httpStatus.OK).json({ 
                message: "Login successful",
                token: token 
            });
        } else {
            console.log("Password comparison failed");
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid username or password" });
        }

    } catch (e) {
        console.error("Login error:", e);
        return res.status(500).json({ message: `Something went wrong: ${e.message}` });
    }
};

const register = async (req, res) => {
    console.log("=== REGISTER DEBUG ===");
    console.log("Request body:", req.body);
    
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ message: "Please provide name, username, and password" });
    }

    try {
        console.log("Checking if user exists:", username);
        
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("User already exists");
            return res.status(httpStatus.CONFLICT).json({ message: "User already exists" });
        }

        console.log("Hashing password...");
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Password hashed successfully");
        console.log("Original password:", password);
        console.log("Hashed password:", hashedPassword);

        // Create new user
        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        });

        console.log("Saving user to database...");
        await newUser.save();
        
        console.log("User registered successfully:", username);
        
        // Test password immediately after registration
        console.log("Testing password hash immediately:");
        const testComparison = await bcrypt.compare(password, hashedPassword);
        console.log("Immediate password test result:", testComparison);
        
        res.status(httpStatus.CREATED).json({ message: "User registered successfully" });

    } catch (e) {
        console.error("Registration error:", e);
        res.status(500).json({ message: `Something went wrong: ${e.message}` });
    }
};

const getUserHistory = async (req, res) => {
    console.log("=== GET USER HISTORY DEBUG ===");
    console.log("Query params:", req.query);
    
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        console.log("Looking for user with token:", token);
        
        // Find user by token
        const user = await User.findOne({ token: token });
        console.log("User found by token:", user ? "Yes" : "No");
        
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Invalid token" });
        }

        console.log("Getting meetings for user:", user.username);
        // Get meetings for this user
        const meetings = await Meeting.find({ user_id: user.username });
        console.log("Meetings found:", meetings.length);
        
        res.json(meetings);
        
    } catch (e) {
        console.error("Get history error:", e);
        res.status(500).json({ message: `Something went wrong: ${e.message}` });
    }
};

const addToHistory = async (req, res) => {
    console.log("=== ADD TO HISTORY DEBUG ===");
    console.log("Request body:", req.body);
    
    const { token, meeting_code } = req.body;

    if (!token || !meeting_code) {
        return res.status(400).json({ message: "Token and meeting code are required" });
    }

    try {
        console.log("Looking for user with token:", token);
        
        // Find user by token
        const user = await User.findOne({ token: token });
        console.log("User found by token:", user ? "Yes" : "No");
        
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Invalid token" });
        }

        // Create new meeting record
        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        });

        console.log("Saving meeting to database...");
        await newMeeting.save();
        
        console.log("Meeting added to history for user:", user.username);
        res.status(httpStatus.CREATED).json({ message: "Added code to history" });
        
    } catch (e) {
        console.error("Add to history error:", e);
        res.status(500).json({ message: `Something went wrong: ${e.message}` });
    }
};

export { login, register, getUserHistory, addToHistory };