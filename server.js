const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbPath = process.env.NODE_ENV === 'test' 
  ? path.join(__dirname, 'test', 'test.sqlite')
  : './netflix.sqlite';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
const initializeDatabase = () => {
  // Create users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create favorites table
  db.run(`CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    show_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, show_id)
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
};

// Call initializeDatabase when the server starts
initializeDatabase();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        
        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET);
        res.json({ token, user: { id: this.lastID, username, email } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    try {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
      res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Favorites routes
app.post('/api/favorites', authenticateToken, (req, res) => {
  const { show_id } = req.body;
  const user_id = req.user.id;
  
  db.run(
    'INSERT INTO favorites (user_id, show_id) VALUES (?, ?)',
    [user_id, show_id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Title already in favorites' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

app.delete('/api/favorites/:show_id', authenticateToken, (req, res) => {
  const { show_id } = req.params;
  const user_id = req.user.id;
  
  db.run(
    'DELETE FROM favorites WHERE user_id = ? AND show_id = ?',
    [user_id, show_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Removed from favorites' });
    }
  );
});

app.get('/api/favorites', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  
  db.all(
    `SELECT n.* FROM netflix n
     INNER JOIN favorites f ON n.show_id = f.show_id
     WHERE f.user_id = ?`,
    [user_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Review routes
app.post('/api/reviews', authenticateToken, (req, res) => {
  const { show_id, rating, review } = req.body;
  const user_id = req.user.id;
  
  db.run(
    'INSERT INTO reviews (show_id, rating, review, user_id) VALUES (?, ?, ?, ?)',
    [show_id, rating, review, user_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

app.get('/api/reviews/user', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  
  db.all(
    `SELECT r.*, n.title FROM reviews r
     INNER JOIN netflix n ON r.show_id = n.show_id
     WHERE r.user_id = ?
     ORDER BY r.created_at DESC`,
    [user_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.get('/api/reviews/:show_id', (req, res) => {
  const { show_id } = req.params;
  db.all(
    `SELECT r.*, u.username FROM reviews r
     LEFT JOIN users u ON r.user_id = u.id
     WHERE r.show_id = ?
     ORDER BY r.created_at DESC`,
    [show_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

app.get('/api/reviews/:show_id/average', (req, res) => {
  const { show_id } = req.params;
  db.get('SELECT AVG(rating) as average_rating FROM reviews WHERE show_id = ?', [show_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ average_rating: row.average_rating || 0 });
  });
});

// Title routes
app.get('/api/titles', (req, res) => {
  const { search, director, rating, sortBy, sortOrder, page = 1, limit = 20 } = req.query;
  let query = 'SELECT * FROM netflix WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (director) {
    query += ' AND director LIKE ?';
    params.push(`%${director}%`);
  }

  if (rating) {
    query += ' AND rating = ?';
    params.push(rating);
  }

  if (sortBy) {
    query += ` ORDER BY ${sortBy} ${sortOrder || 'ASC'}`;
  }

  // Add pagination
  const offset = (page - 1) * limit;
  query += ` LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);

  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) as total FROM netflix WHERE 1=1';
  const countParams = [];

  if (search) {
    countQuery += ' AND (title LIKE ? OR description LIKE ?)';
    countParams.push(`%${search}%`, `%${search}%`);
  }

  if (director) {
    countQuery += ' AND director LIKE ?';
    countParams.push(`%${director}%`);
  }

  if (rating) {
    countQuery += ' AND rating = ?';
    countParams.push(rating);
  }

  db.get(countQuery, countParams, (err, countRow) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        titles: rows,
        pagination: {
          total: countRow.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(countRow.total / limit)
        }
      });
    });
  });
});

app.get('/api/titles/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM netflix WHERE show_id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Title not found' });
      return;
    }
    res.json(row);
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Export the app for testing
module.exports = app;

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
} 