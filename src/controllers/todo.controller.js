const db = require('../config/db');

// GET semua todo
exports.getTodos = async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM todos ORDER BY created_at DESC'
  );
  res.json(rows);
};

// CREATE todo
exports.createTodo = async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title wajib diisi' });
  }

  await db.query(
    'INSERT INTO todos (title) VALUES (?)',
    [title]
  );

  res.status(201).json({ message: 'Todo berhasil ditambahkan' });
};

// UPDATE status todo
exports.updateTodo = async (req, res) => {
  const { id } = req.params;
  const { is_completed } = req.body;

  await db.query(
    'UPDATE todos SET is_completed=? WHERE id=?',
    [is_completed, id]
  );

  res.json({ message: 'Todo berhasil diupdate' });
};

// DELETE todo
exports.deleteTodo = async (req, res) => {
  const { id } = req.params;

  await db.query(
    'DELETE FROM todos WHERE id=?',
    [id]
  );

  res.json({ message: 'Todo berhasil dihapus' });
};
