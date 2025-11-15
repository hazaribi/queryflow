import express from 'express';
import { WebSocketServer } from 'ws';
import { db } from '../config/database.js';

const router = express.Router();
let wss;

export const initWebSocket = (server) => {
  wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws) => {
    console.log('Client connected');
    
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });
};

export const broadcastUpdate = (type, data) => {
  if (wss) {
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type, data }));
      }
    });
  }
};

// Webhook endpoint for external integrations
router.post('/webhook/email', (req, res) => {
  const { subject, body, from, to } = req.body;
  
  db.run(
    'INSERT INTO queries (content, channel, customer_email, customer_name) VALUES (?, ?, ?, ?)',
    [`${subject}\n\n${body}`, 'email', from, from.split('@')[0]],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      const newQuery = {
        id: this.lastID,
        content: `${subject}\n\n${body}`,
        channel: 'email',
        customer_email: from,
        status: 'open',
        priority: 'medium'
      };
      
      broadcastUpdate('new_query', newQuery);
      res.json({ success: true, id: this.lastID });
    }
  );
});

export default router;