import express from 'express';
import { db } from '../config/database.js';
import { generateReport, exportToCSV } from '../services/export.js';
import { getSLAMetrics } from '../services/sla.js';

const router = express.Router();

// Generate and download CSV report
router.get('/export', async (req, res) => {
  try {
    const { start_date, end_date, status, priority, channel } = req.query;
    
    const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = end_date || new Date().toISOString();
    
    const queries = await generateReport(startDate, endDate, { status, priority, channel });
    const csv = exportToCSV(queries);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=queries-report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get SLA metrics
router.get('/sla', async (req, res) => {
  try {
    const metrics = await getSLAMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Advanced analytics
router.get('/analytics/advanced', (req, res) => {
  const queries = [
    // Queries by hour of day
    `SELECT strftime('%H', created_at) as hour, COUNT(*) as count 
     FROM queries 
     WHERE created_at >= date('now', '-7 days') 
     GROUP BY hour 
     ORDER BY hour`,
    
    // Resolution time by priority
    `SELECT priority, 
            AVG(julianday(updated_at) - julianday(created_at)) * 24 * 60 as avg_minutes
     FROM queries 
     WHERE status = 'closed' 
     GROUP BY priority`,
    
    // Top customers by query count
    `SELECT customer_email, customer_name, COUNT(*) as query_count
     FROM queries 
     WHERE customer_email IS NOT NULL 
     GROUP BY customer_email 
     ORDER BY query_count DESC 
     LIMIT 10`
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
      hourly_distribution: results[0],
      resolution_by_priority: results[1],
      top_customers: results[2]
    });
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

export default router;