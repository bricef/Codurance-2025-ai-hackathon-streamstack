const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const TEST_DB_PATH = path.join(__dirname, 'test.sqlite');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Delete existing test database if it exists
if (fs.existsSync(TEST_DB_PATH)) {
  fs.unlinkSync(TEST_DB_PATH);
}

const db = new sqlite3.Database(TEST_DB_PATH);

function initializeTestDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        username TEXT
      )`);

      // Create netflix table
      db.run(`CREATE TABLE IF NOT EXISTS netflix (
        show_id TEXT PRIMARY KEY,
        type TEXT,
        title TEXT,
        director TEXT,
        cast TEXT,
        country TEXT,
        date_added TEXT,
        release_year TEXT,
        rating TEXT,
        duration TEXT,
        listed_in TEXT,
        description TEXT
      )`);

      // Create reviews table
      db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        show_id TEXT,
        rating INTEGER,
        review TEXT,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (show_id) REFERENCES netflix (show_id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Create favorites table
      db.run(`CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        show_id TEXT,
        user_id INTEGER,
        FOREIGN KEY (show_id) REFERENCES netflix (show_id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(show_id, user_id)
      )`);

      resolve();
    });
  });
}

function cleanupTestDb() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('DELETE FROM reviews');
      db.run('DELETE FROM favorites');
      db.run('DELETE FROM users');
      db.run('DELETE FROM netflix', (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  });
}

function generateTestToken(userId, username) {
  return jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '1h' });
}

// Run before all tests
beforeAll(async () => {
  await initializeTestDb();
});

// Run after all tests
afterAll(async () => {
  await cleanupTestDb();
});

// Clear tables before each test
beforeEach(async () => {
  await cleanupTestDb();
});

module.exports = {
  db,
  generateTestToken,
  initializeTestDb,
  cleanupTestDb,
  JWT_SECRET
}; 