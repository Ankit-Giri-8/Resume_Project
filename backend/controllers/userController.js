import User from "../models/usermodel.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

//genertae JWT token
const generateToken = (userId) => {
    return jwt.sign({ id:userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

export const registerUser = async (req, res) => {
    
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
        }
        //hashing the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({ 
            id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(User._id),
            message: "User registered successfully"
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
            message: "User logged in successfully"
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message
        });
    }
}

//get user profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message
        });
    }
}