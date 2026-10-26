const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("MONGO_URI:", process.env.MONGO_URI);

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto"); // For verification tokens

// MongoDB
const { MongoClient, ObjectId } = require("mongodb");

const app = express();

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(cookieParser());

// MongoDB client
const client = new MongoClient(process.env.MONGO_URI);
let db;

// Auth middleware (example, use ObjectId later in routes safely)
function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Not logged in" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
}

// EMAIL SETUP
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function start() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");

        db = client.db("gameDB");


console.log("✅ All users updated with new fields");//run once and delete this block

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error(err);
    }
}
start();

// TEST route
app.get("/", (req, res) => {
    res.send("Server is running");
});


// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // ✅ 1. EMAIL VALIDATION (NEW CODE HERE)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com)$/;

        if (!emailRegex.test(email)) {
            return res.json({
                success: false,
                message: "Enter a valid Gmail, Yahoo, or Outlook email"
            });
        }

        // ✅ 2. PASSWORD VALIDATION
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.json({
                success: false,
                message: "Password must be at least 8 characters, include a capital letter and a number"
            });
        }

        // ✅ 3. CHECK DUPLICATES
        const existingUser = await db.collection("users").findOne({
            $or: [{ name: name }, { email: email }]
        });

        if (existingUser) {
            return res.json({
                success: false,
                message: "Username or email already exists!"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

       const crypto = require("crypto"); // ADD at top of file

// generate verification token
       const token = crypto.randomBytes(32).toString("hex");

       await db.collection("users").insertOne({
    name,
    email,
    password: hashedPassword,
    verified: false,
    verifyToken: token,
    highScore: 0,
    avatar: ""
});

        // ✅ SEND EMAIL — wrapped in try/catch
        try {
          await transporter.sendMail({
          from: "your_email@gmail.com",
          to: email,
          subject: "Verify your email - Lumina Quest",
         html: `
        <h2>Welcome to Lumina Quest 🎮</h2>
        <p>Click below to verify your email:</p>
        <a href="http://localhost:3000/verify-email?token=${token}">
            Verify Email
         </a> `
});
        } catch (mailErr) {
            console.error("Failed to send email:", mailErr.message);

            // Delete user if email fails
            await db.collection("users").deleteOne({ email });
            return res.json({
                success: false,
                message: "Invalid email or cannot send message. Please use a real email."
            });
        }

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
//login route 
// ================= LOGIN =================

app.post("/login", async (req, res) => {
    try {
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(400).json({ success: false, message: "Missing username or password" });
        }

        const user = await db.collection("users").findOne({ name });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        if (!user.verified) {
    return res.status(400).json({
        success: false,
        message: "Please verify your email before logging in"
    });
}

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ success: false, message: "Incorrect password" });
        }

        // ✅ Login successful
       const token = jwt.sign(
    { userId: user._id, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
);

        // send cookie
        res.cookie("token", token, {
        httpOnly: true,
        secure: false, // set true if using https
        sameSite: "lax"
});

res.json({ success: true, message: "Login successful" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
//routes example
app.get("/profile", authMiddleware, async (req, res) => {
    res.json({
        success: true,
        message: "Welcome!",
        user: req.user
    });
});
app.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out" });
});
// ================= GET PROFILE =================
app.get("/get-profile", authMiddleware, async (req, res) => {
    try {
        const user = await db.collection("users").findOne({
            _id: new ObjectId(req.user.userId)
        });

        if (!user) {
            return res.status(404).json({ success: false });
        }

        res.json({
            success: true,
            user
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
// ================= UPLOAD AVATAR =================

app.post("/upload-avatar", authMiddleware, async (req, res) => {
    const { avatar } = req.body;

    try {
        await db.collection("users").updateOne(
            { _id: new ObjectId(req.user.userId) },
            { $set: { avatar } }
        );

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
// ================= SAVE SCORE =================
app.post("/save-score", authMiddleware, async (req, res) => {
    try {
        const newTime = req.body.score;
        const userId = new ObjectId(req.user.userId);

        const user = await db.collection("users").findOne({ _id: userId });

        if (!user) {
            return res.json({ success: false });
        }

        let isNewRecord = false;

        // ✅ CHECK IF NEW RECORD
        if (!user.highScore || newTime < user.highScore) {
            isNewRecord = true;

            await db.collection("users").updateOne(
                { _id: userId },
                { $set: { highScore: newTime } }
            );
        }

        // ✅ SEND RESULT TO FRONTEND
        res.json({ success: true, newRecord: isNewRecord });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});
// ================= LEADERBOARD =================
app.get("/leaderboard", async (req, res) => {
    try {
        // ✅ Fetch ALL users who have a highScore field, skip the $gt filter for now
        const users = await db.collection("users")
            .find({ highScore: { $exists: true } })
            .toArray();

        // ✅ Normalize to numbers, filter out 0s, sort and limit in JS
        const cleaned = users
            .map(u => ({ ...u, highScore: parseFloat(u.highScore) || 0 }))
            .filter(u => u.highScore > 0)
            .sort((a, b) => a.highScore - b.highScore)
            .slice(0, 10);

        res.json({ success: true, users: cleaned });

    } catch (err) {
        console.error("Leaderboard error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});
// ================= EMAIL VERIFICATION =================
app.get("/verify-email", async (req, res) => {
    const { token } = req.query;

    try {
        const user = await db.collection("users").findOne({ verifyToken: token });

        if (!user) {
            return res.send("Invalid or expired token ❌");
        }

        await db.collection("users").updateOne(
            { _id: user._id },
            {
                $set: { verified: true },
                $unset: { verifyToken: "" }
            }
        );

        res.send("✅ Email verified successfully! You can now log in.");

    } catch (err) {
        console.error(err);
        res.send("Server error");
    }
});
