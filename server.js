require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to Supabase PostgreSQL
const pool = new Pool({
    connectionString: "https://xufshwxbdlznoxpvsalf.supabase.co", // Use Supabase DB URL
    ssl: { rejectUnauthorized: false }
});

// User Registration Endpoint
app.post("/register", async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hashedPassword]
        );
        res.status(201).json({ user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User Login Endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            if (await bcrypt.compare(password, user.password)) {
                const token = jwt.sign({ id: user.id, email: user.email }, "SECRET", { expiresIn: "1h" });
                res.json({ message: "Login successful", token });
            } else {
                res.status(401).json({ error: "Invalid credentials" });
            }
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start Express Server
app.listen(3000, () => console.log("Server running on port 3000"));
