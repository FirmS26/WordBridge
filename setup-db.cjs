const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'awl.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log('Setting up new database tables...');
  
  // Drop existing tables (clean slate)
  db.run('DROP TABLE IF EXISTS guidance_rules');
  db.run('DROP TABLE IF EXISTS collocations');
  db.run('DROP TABLE IF EXISTS lemmas');
  db.run('DROP TABLE IF EXISTS words');
  db.run('DROP TABLE IF EXISTS users');
  db.run('DROP TABLE IF EXISTS user_scores');

  // Create words table
  db.run(`
    CREATE TABLE words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT UNIQUE NOT NULL,
      correct_example TEXT
    )
  `);

  // Create lemmas table (word forms)
  db.run(`
    CREATE TABLE lemmas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL,
      lemma TEXT NOT NULL,
      FOREIGN KEY(word_id) REFERENCES words(id) ON DELETE CASCADE
    )
  `);

  // Create collocations table
  db.run(`
    CREATE TABLE collocations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL,
      collocation TEXT NOT NULL,
      FOREIGN KEY(word_id) REFERENCES words(id) ON DELETE CASCADE
    )
  `);

  // Create guidance rules table
  db.run(`
    CREATE TABLE guidance_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER,
      rule_type TEXT NOT NULL,
      pattern TEXT,
      message TEXT NOT NULL,
      correct_example TEXT,
      priority INTEGER DEFAULT 0,
      FOREIGN KEY(word_id) REFERENCES words(id) ON DELETE CASCADE
    )
  `);
  

  db.run(`
    CREATE TABLE users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name STRING NOT NULL,
      email STRING NOT NULL,
      password STRING NOT NULL
    )
  `);//Add time of account creation? Let users select their starting level? Split up first and last name?
    //Add "UNIQUE" constraints
    
    db.run(`
    CREATE TABLE user_scores (
      user_id INTEGER,
      word_id INTEGER,
      attempt_time STRING,
      results STRING,
      FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
      FOREIGN KEY(word_id) REFERENCES words(id) ON DELETE CASCADE
    )
  `);//if time is too much work just increment per user so that it can be ordered just w/o showing exact time
  //or maybe they'll just be in order automatically


  console.log('✅ Tables created successfully.');
});

db.close();