require("dotenv").config(); // Loads environment variables from a .env file.

const express = require("express"); // Imports Express.js to create a web server.
const bcrypt = require("bcryptjs"); // Imports bcrypt for password hashing and verification.
const jwt = require("jsonwebtoken"); // Imports JSON Web Token (JWT) for authentication.
const { Pool } = require("pg"); // Imports PostgreSQL client for database interaction.
const cors = require("cors"); // Enables Cross-Origin Resource Sharing (CORS) for API security.

const app = express(); // Creates an Express application instance.
app.use(express.json()); // Enables parsing of JSON request bodies.
app.use(cors()); // Allows cross-origin requests to access the API.

// Secure Environment Variables
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret"; // Retrieves JWT secret from environment variables or uses a default.

// Connect to Supabase PostgreSQL
const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL, // Retrieves DB connection string securely from environment variables.
    ssl: { rejectUnauthorized: false } // Ensures secure connection to the database.
});

// User Registration Endpoint
app.post("/register", async (req, res) => { // Defines an API route to register new users.
    const { email, password } = req.body; // Extracts email and password from the request body.

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Asynchronously hashes the password before storing it in the database.

        const result = await pool.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *", // Inserts the new user into the database and returns the inserted row.
            [email, hashedPassword]
        );

        res.status(201).json({ user: result.rows[0] }); // Sends a success response with the registered user details.
    } catch (error) {
        console.error("Registration error:", error); // Logs the error to the console for debugging.
        res.status(500).json({ error: "Registration failed. Please try again." }); // Sends a generic error response.
    }
});

// User Login Endpoint
app.post("/login", async (req, res) => { // Defines an API route to handle user login.
    const { email, password } = req.body; // Extracts email and password from the request body.

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]); // Retrieves user details from the database based on the email.

        if (result.rows.length > 0) { // Checks if the user exists in the database.
            const user = result.rows[0]; // Gets the user details.

            if (await bcrypt.compare(password, user.password)) { // Verifies the hashed password asynchronously.
                const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" }); // Generates a JWT token for authentication.

                res.json({ message: "Login successful", token }); // Sends a success response with the JWT token.
            } else {
                res.status(401).json({ error: "Invalid credentials. Please check your email or password." }); // Sends an error response if the password is incorrect.
            }
        } else {
            res.status(404).json({ error: "User not found. Please register first." }); // Sends an error response if the email is not found.
        }
    } catch (error) {
        console.error("Login error:", error); // Logs the error for debugging.
        res.status(500).json({ error: "Login failed. Please try again later." }); // Sends a generic error response.
    }
});

// Start Express Server
const PORT = process.env.PORT || 3000; // Retrieves the port from environment variables or defaults to 3000.
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`)); // Starts the Express server and logs the running port.
