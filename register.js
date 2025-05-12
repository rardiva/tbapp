const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.postgresql://postgres:[YOUR-PASSWORD]@db.xufshwxbdlznoxpvsalf.supabase.co:5432/postgres, // Get this from Supabase dashboard
  ssl: { rejectUnauthorized: false }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
    res.json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
