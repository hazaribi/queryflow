import { db } from '../config/database.js';

export const getSLAMetrics = () => {
  return new Promise((resolve, reject) => {
    const queries = [
      // SLA compliance (queries resolved within 4 hours)
      `SELECT 
        COUNT(CASE WHEN (julianday(updated_at) - julianday(created_at)) * 24 <= 4 THEN 1 END) * 100.0 / COUNT(*) as sla_compliance
       FROM queries 
       WHERE status = 'closed'`,
      
      // SLA violations (open queries older than 4 hours)
      `SELECT COUNT(*) as sla_violations
       FROM queries 
       WHERE status IN ('open', 'in_progress') 
       AND (julianday('now') - julianday(created_at)) * 24 > 4`,
      
      // Average resolution time in hours
      `SELECT AVG((julianday(updated_at) - julianday(created_at)) * 24) as avg_resolution_hours
       FROM queries 
       WHERE status = 'closed'`
    ];

    Promise.all(queries.map(query => 
      new Promise((resolve, reject) => {
        db.all(query, (err, rows) => {
          if (err) reject(err);
          else resolve(rows[0]);
        });
      })
    )).then(results => {
      resolve({
        sla_compliance: Math.round(results[0].sla_compliance || 0),
        sla_violations: results[1].sla_violations || 0,
        avg_resolution_hours: Math.round((results[2].avg_resolution_hours || 0) * 10) / 10
      });
    }).catch(reject);
  });
};