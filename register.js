const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  user: 'your_db_user',
  host: 'your_db_host',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 'your_db_port'
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

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
