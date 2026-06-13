-- SQL Schema for Raghus World D1 database

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS buttons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grade TEXT NOT NULL,
  section TEXT DEFAULT NULL,
  set_num INTEGER NOT NULL,
  lesson_name TEXT NOT NULL,
  url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  color TEXT DEFAULT '#fef08a',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- 'document', 'sheet', 'doc', 'game'
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT NULL
);

-- Seed default settings (passwords) if not already present
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_password', 'raghu123');
INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', 'admin123');
