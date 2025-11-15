import express from 'express';
import { db } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Signup
router.post('/signup', (req, res) => {
  const { email, name } = req.body;
  
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }
  
  db.run('INSERT INTO users (email, name, role) VALUES (?, ?, ?)', 
    [email, name, 'agent'], 
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'User already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      const newUser = { id: this.lastID, email, name, role: 'agent' };
      const token = generateToken(newUser);
      res.status(201).json({ token, user: newUser });
    }
  );
});

// Login
router.post('/login', (req, res) => {
  const { email } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (!user) {
      // Auto-create demo users if they don't exist
      const demoUsers = {
        'admin@company.com': { name: 'Admin User', role: 'admin' },
        'john@company.com': { name: 'John Smith', role: 'agent' },
        'sarah@company.com': { name: 'Sarah Johnson', role: 'agent' }
      };
      
      if (demoUsers[email]) {
        const { name, role } = demoUsers[email];
        db.run('INSERT INTO users (email, name, role) VALUES (?, ?, ?)', 
          [email, name, role], 
          function(insertErr) {
            if (insertErr) return res.status(500).json({ error: insertErr.message });
            
            const newUser = { id: this.lastID, email, name, role };
            const token = generateToken(newUser);
            res.json({ token, user: newUser });
          }
        );
        return;
      }
      
      return res.status(401).json({ error: 'User not found' });
    }
    
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  });
});

// Get current user
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    db.get('SELECT id, email, name, role FROM users WHERE id = ?', [decoded.id], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    });
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

export default router;