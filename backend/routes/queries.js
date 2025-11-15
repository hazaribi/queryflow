import express from 'express';
import { db } from '../config/database.js';

const router = express.Router();

// Get all queries with user info
router.get('/', (req, res) => {
  const query = `
    SELECT q.*, u.name as assignee_name, u.email as assignee_email
    FROM queries q
    LEFT JOIN users u ON q.assignee_id = u.id
    ORDER BY q.created_at DESC
  `;
  
  db.all(query, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create new query
router.post('/', (req, res) => {
  const { content, channel, priority = 'medium', customer_email, customer_name, tags } = req.body;
  
  db.run(
    'INSERT INTO queries (content, channel, priority, customer_email, customer_name, tags) VALUES (?, ?, ?, ?, ?, ?)',
    [content, channel, priority, customer_email, customer_name, tags],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        id: this.lastID, 
        content, 
        channel, 
        priority, 
        status: 'open',
        customer_email,
        customer_name,
        tags
      });
    }
  );
});

// Update query
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const fields = [];
  const values = [];
  
  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.assignee_id !== undefined) {
    fields.push('assignee_id = ?');
    values.push(updates.assignee_id);
  }
  if (updates.priority !== undefined) {
    fields.push('priority = ?');
    values.push(updates.priority);
  }
  if (updates.tags !== undefined) {
    fields.push('tags = ?');
    values.push(updates.tags);
  }
  
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const query = `UPDATE queries SET ${fields.join(', ')} WHERE id = ?`;
  
  db.run(query, values, function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Get analytics
router.get('/analytics', (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total FROM queries',
    'SELECT COUNT(*) as open FROM queries WHERE status = "open"',
    'SELECT COUNT(*) as in_progress FROM queries WHERE status = "in_progress"',
    'SELECT COUNT(*) as closed FROM queries WHERE status = "closed"',
    'SELECT COUNT(*) as high_priority FROM queries WHERE priority = "high"',
    'SELECT channel, COUNT(*) as count FROM queries GROUP BY channel'
  ];
  
  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    })
  )).then(results => {
    res.json({
      total: results[0][0].total,
      open: results[1][0].open,
      in_progress: results[2][0].in_progress,
      closed: results[3][0].closed,
      high_priority: results[4][0].high_priority,
      by_channel: results[5],
      avg_response_time: 45
    });
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

export default router;