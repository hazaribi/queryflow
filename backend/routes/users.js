import express from 'express';
import { db } from '../config/database.js';

const router = express.Router();

// Get all users
router.get('/', (req, res) => {
  db.all('SELECT id, email, name, role, created_at FROM users', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create new user
router.post('/', (req, res) => {
  const { email, name, role = 'agent' } = req.body;
  
  db.run(
    'INSERT INTO users (email, name, role) VALUES (?, ?, ?)',
    [email, name, role],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, email, name, role });
    }
  );
});

export default router;