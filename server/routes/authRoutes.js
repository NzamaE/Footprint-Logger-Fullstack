const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const connectToDatabase = require('../models/db');

const { ObjectId } = require('mongodb');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Middleware: parse cookies
router.use(cookieParser());

// =====================
// Middleware: Verify JWT from Cookie
// =====================
function authenticateToken(req, res, next) {
    const token = req.cookies.token; // read from cookie

    if (!token) {
        return res.status(401).json({ message: "Access token missing" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = user; // attach payload to request
        next();
    });
}

// =====================
// Register
// =====================
router.post("/register", async (req, res) => {
    try {
        const theDb = await connectToDatabase();

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        const user = {
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            role: req.body.role,
            password: hashedPassword
        };

        const response = await theDb.collection('Users').insertOne(user);

        res.status(201).json({
            message: "User registered successfully",
            userId: response.insertedId
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(400).json({ message: "Registration unsuccessful" });
    }
});

// =====================
// Login
// =====================
router.post("/login", async (req, res) => {
    try {
        const theDb = await connectToDatabase();
        const { email, password } = req.body;

        const findUser = await theDb.collection('Users').findOne({ email });

        if (!findUser) {
            return res.status(403).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, findUser.password);

        if (!isMatch) {
            return res.status(403).json({ message: "Incorrect password" });
        }

        // sign JWT
        const token = jwt.sign(
            { id: findUser._id, email: findUser.email, role: findUser.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        // send token in HttpOnly cookie
        res.cookie("token", token, {
            httpOnly: true,   // JS can’t read cookie
            secure: process.env.NODE_ENV === "production", // only over HTTPS in prod
            sameSite: "strict", // protect against CSRF
            maxAge: 60 * 60 * 1000 // 1 hour
        });

        res.status(200).json({
            message: "Login successful"
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// =====================
// Logout (clear cookie)
// =====================
router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
});

// =====================
// Example Protected Route
// =====================
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const theDb = await connectToDatabase();
           console.log("The user id from the url:"+req.user.id );
        const user = await theDb.collection('Users').findOne(
            { _id: new ObjectId(req.user.id) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile fetched successfully",
            data: user
        });

    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
