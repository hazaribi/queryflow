import express from 'express';
import { db } from '../config/database.js';
import { analyzeSentiment, categorizeQuery, generateResponseSuggestions, predictPriority } from '../services/ai.js';

const router = express.Router();

// Analyze query with AI
router.post('/analyze', (req, res) => {
  const { content, customer_tier = 'standard' } = req.body;
  
  try {
    const sentiment = analyzeSentiment(content);
    const category = categorizeQuery(content);
    const suggestions = generateResponseSuggestions(content, category.category);
    const priority = predictPriority(content, customer_tier);
    
    res.json({
      sentiment,
      category,
      suggestions,
      predicted_priority: priority,
      analysis_timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-process new query with AI
router.post('/process-query', (req, res) => {
  const { query_id } = req.body;
  
  db.get('SELECT * FROM queries WHERE id = ?', [query_id], (err, query) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!query) return res.status(404).json({ error: 'Query not found' });
    
    try {
      const sentiment = analyzeSentiment(query.content);
      const category = categorizeQuery(query.content);
      const priority = predictPriority(query.content);
      
      // Update query with AI insights
      const aiData = {
        sentiment: sentiment.sentiment,
        category: category.category,
        ai_confidence: Math.min(sentiment.confidence, category.confidence)
      };
      
      db.run(
        'UPDATE queries SET tags = ?, priority = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [JSON.stringify(aiData), priority, query_id],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, ai_insights: aiData, updated_priority: priority });
        }
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Get AI insights dashboard
router.get('/insights', (req, res) => {
  const queries = [
    // Sentiment distribution
    `SELECT 
       json_extract(tags, '$.sentiment') as sentiment,
       COUNT(*) as count
     FROM queries 
     WHERE tags IS NOT NULL 
     GROUP BY json_extract(tags, '$.sentiment')`,
    
    // Category distribution
    `SELECT 
       json_extract(tags, '$.category') as category,
       COUNT(*) as count
     FROM queries 
     WHERE tags IS NOT NULL 
     GROUP BY json_extract(tags, '$.category')`,
    
    // AI confidence levels
    `SELECT 
       CASE 
         WHEN json_extract(tags, '$.ai_confidence') >= 0.8 THEN 'high'
         WHEN json_extract(tags, '$.ai_confidence') >= 0.6 THEN 'medium'
         ELSE 'low'
       END as confidence_level,
       COUNT(*) as count
     FROM queries 
     WHERE tags IS NOT NULL 
     GROUP BY confidence_level`
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
      sentiment_distribution: results[0],
      category_distribution: results[1],
      confidence_levels: results[2]
    });
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

export default router;