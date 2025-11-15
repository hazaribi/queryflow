import { db } from '../config/database.js';

export const generateReport = (startDate, endDate, filters = {}) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT q.*, u.name as assignee_name 
      FROM queries q 
      LEFT JOIN users u ON q.assignee_id = u.id 
      WHERE q.created_at BETWEEN ? AND ?
    `;
    
    const params = [startDate, endDate];
    
    if (filters.status) {
      query += ' AND q.status = ?';
      params.push(filters.status);
    }
    
    if (filters.priority) {
      query += ' AND q.priority = ?';
      params.push(filters.priority);
    }
    
    if (filters.channel) {
      query += ' AND q.channel = ?';
      params.push(filters.channel);
    }
    
    query += ' ORDER BY q.created_at DESC';
    
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const exportToCSV = (data) => {
  if (!data || data.length === 0) {
    return 'No data available';
  }
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value || ''
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
};