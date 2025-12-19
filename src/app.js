const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Test DB connection
db.getConnection()
  .then(() => console.log('DB connected'))
  .catch(err => console.error('DB connection error:', err));

// ===== CRUD ROUTES =====

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM todos ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get single todo by id
app.get('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM todos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Todo not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('DB Query Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const [result] = await db.query('INSERT INTO todos (title) VALUES (?)', [title]);
    const [todo] = await db.query('SELECT * FROM todos WHERE id = ?', [result.insertId]);
    res.status(201).json(todo[0]);
  } catch (err) {
    console.error('DB Insert Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update todo by id
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, is_completed } = req.body;

    const [check] = await db.query('SELECT * FROM todos WHERE id = ?', [id]);
    if (check.length === 0) return res.status(404).json({ error: 'Todo not found' });

    await db.query(
      'UPDATE todos SET title = ?, is_completed = ? WHERE id = ?',
      [title ?? check[0].title, is_completed ?? check[0].is_completed, id]
    );

    const [updated] = await db.query('SELECT * FROM todos WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error('DB Update Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete todo by id
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [check] = await db.query('SELECT * FROM todos WHERE id = ?', [id]);
    if (check.length === 0) return res.status(404).json({ error: 'Todo not found' });

    await db.query('DELETE FROM todos WHERE id = ?', [id]);
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error('DB Delete Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = app;
