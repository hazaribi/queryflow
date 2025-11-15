import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'data', 'queries.db');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'agent',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Queries table (enhanced)
    db.run(`CREATE TABLE IF NOT EXISTS queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      channel TEXT NOT NULL,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'open',
      assignee_id INTEGER,
      customer_email TEXT,
      customer_name TEXT,
      tags TEXT,
      response_time INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignee_id) REFERENCES users (id)
    )`);

    // Insert default users with proper error handling
    const demoUsers = [
      ['admin@company.com', 'Admin User', 'admin'],
      ['john@company.com', 'John Smith', 'agent'],
      ['sarah@company.com', 'Sarah Johnson', 'agent']
    ];
    
    demoUsers.forEach(([email, name, role]) => {
      db.run('INSERT OR REPLACE INTO users (email, name, role) VALUES (?, ?, ?)', 
        [email, name, role], 
        (err) => {
          if (err) console.error(`Error creating user ${email}:`, err.message);
        }
      );
    });

    // Insert sample queries
    db.run(`INSERT OR IGNORE INTO queries (content, channel, priority, status, assignee_id, customer_email, customer_name) VALUES 
      ('How do I reset my password?', 'email', 'low', 'open', NULL, 'customer1@example.com', 'John Doe'),
      ('Product not working after update!', 'social', 'high', 'open', NULL, 'customer2@example.com', 'Jane Smith'),
      ('When will new features be released?', 'chat', 'medium', 'open', NULL, 'customer3@example.com', 'Bob Wilson'),
      ('Billing issue - charged twice', 'email', 'high', 'in_progress', 2, 'customer4@example.com', 'Alice Brown')`);
  });
}