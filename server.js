const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = new sqlite3.Database('./netflix.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Routes
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

// Reviews table creation
db.run(`CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  show_id TEXT,
  rating INTEGER,
  review TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.post('/api/reviews', (req, res) => {
  const { show_id, rating, review } = req.body;
  db.run(
    'INSERT INTO reviews (show_id, rating, review) VALUES (?, ?, ?)',
    [show_id, rating, review],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

app.get('/api/reviews/:show_id', (req, res) => {
  const { show_id } = req.params;
  db.all('SELECT * FROM reviews WHERE show_id = ? ORDER BY created_at DESC', [show_id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/reviews/:show_id/average', (req, res) => {
  const { show_id } = req.params;
  db.get('SELECT AVG(rating) as average_rating FROM reviews WHERE show_id = ?', [show_id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ average_rating: row.average_rating || 0 });
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 