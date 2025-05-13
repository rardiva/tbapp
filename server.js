const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

if (!SUPABASE_URL || !SUPABASE_API_KEY) {
  console.error("Error: Missing Supabase environment variables.");
  process.exit(1);
}

app.post("/api/server", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Secure password hashing

    const response = await fetch(`${SUPABASE_URL}/editor/users`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_API_KEY,
        Authorization: `Bearer ${SUPABASE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: username, password: hashedPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || "Error inserting user." });
    }

    res.status(201).json({ message: "User registered", user: data });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed. Please try again later." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
