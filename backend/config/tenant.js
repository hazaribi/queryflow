import { db } from './database.js';

export const createTenantSchema = (tenantId) => {
  const prefix = `tenant_${tenantId}`;
  
  db.serialize(() => {
    // Tenant-specific queries table
    db.run(`CREATE TABLE IF NOT EXISTS ${prefix}_queries (
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
      sla_deadline DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tenant-specific users table
    db.run(`CREATE TABLE IF NOT EXISTS ${prefix}_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'agent',
      department TEXT,
      skills TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tenant settings
    db.run(`CREATE TABLE IF NOT EXISTS ${prefix}_settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });
};

export const getTenantFromRequest = (req) => {
  return req.headers['x-tenant-id'] || req.user?.tenant_id || 'default';
};