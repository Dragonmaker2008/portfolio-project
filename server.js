const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;
const JWT_SECRET = "change_this_to_a_secret_key";

app.use(cors());
app.use(express.json());

const users = {}; 
app.post("/register", (req, res) => {
const { username, password } = req.body;

if (!username || !password) {
return res.status(400).json({ message: "Username and password are required." });
}
if (users[username]) {
return res.status(400).json({ message: "Username already exists." });
}

const otp = String(Math.floor(100000 + Math.random() * 900000));
users[username] = {
password,
otp,
isVerified: false
};

console.log(`OTP for ${username}: ${otp}`);
res.json({ message: `Registered! Check server terminal for OTP: ${otp}` });
});

app.post("/verify-otp", (req, res) => {
const { username, otp } = req.body;
const user = users[username];

if (!user) {
return res.status(404).json({ message: "User not found." });
}
if (user.otp !== otp) {
return res.status(400).json({ message: "Invalid OTP code." });
}
user.isVerified = true;
user.otp = null;
res.json({ message: "OTP verified! You can now log in." });
});

app.post("/login", (req, res) => {
const { username, password } = req.body;
const user = users[username];

if (!user || user.password !== password) {
return res.status(401).json({ message: "Invalid username or password." });
}
if (!user.isVerified) {
return res.status(403).json({ message: "Please verify your OTP before logging in." });
}
const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
res.json({ message: "Login successful!", token });
});

app.get("/dashboard", (req, res) => {
const authHeader = req.headers.authorization;
if (!authHeader || !authHeader.startsWith("Bearer ")) {
return res.status(401).json({ message: "Missing or invalid token." });
}
const token = authHeader.split(" ")[1];
try {
const decoded = jwt.verify(token, JWT_SECRET);
res.json({ message: `Welcome to your dashboard, ${decoded.username}!` });
} catch (err) {
res.status(401).json({ message: "Token invalid or expired." });
}
});

app.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
});