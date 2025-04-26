const request = require('supertest');
const bcrypt = require('bcryptjs');
const { db, initializeTestDb, cleanupTestDb, generateTestToken } = require('./setup');
const app = require('../server');

beforeAll(async () => {
  await initializeTestDb();
});

afterAll(async () => {
  await cleanupTestDb();
});

describe('Recommendation Endpoints', () => {
  let token;
  let userId;

  beforeEach(async () => {
    // Clear tables
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM reviews', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM favorites', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM netflix', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        ['testuser', 'test@example.com', hashedPassword],
        function(err) {
          if (err) reject(err);
          else {
            userId = this.lastID;
            token = generateTestToken(userId, 'testuser');
            resolve();
          }
        }
      );
    });

    // Insert test movies with different genres
    const stmt = db.prepare(`INSERT INTO netflix (
      show_id, type, title, director, rating, release_year, description, listed_in
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    
    stmt.run('s1', 'Movie', 'Action Movie', 'Director 1', 'PG-13', '2020', 'Action movie', 'Action, Adventure');
    stmt.run('s2', 'Movie', 'Comedy Movie', 'Director 2', 'PG', '2021', 'Comedy movie', 'Comedy, Romance');
    stmt.run('s3', 'Movie', 'Drama Movie', 'Director 3', 'R', '2022', 'Drama movie', 'Drama, Thriller');
    stmt.run('s4', 'Movie', 'Action Comedy', 'Director 4', 'PG-13', '2023', 'Action comedy movie', 'Action, Comedy');
    stmt.run('s5', 'Movie', 'Romantic Drama', 'Director 5', 'PG-13', '2023', 'Romantic drama movie', 'Romance, Drama');
    stmt.finalize();
  });

  it('should get personalized recommendations', async () => {
    // Add a favorite movie
    await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({
        show_id: 's1'
      });

    // Add a highly rated review
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        show_id: 's2',
        rating: 5,
        review: 'Great movie!'
      });

    const res = await request(app)
      .get('/api/recommendations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    
    // Should not include movies the user has already interacted with
    const recommendedIds = res.body.map(movie => movie.show_id);
    expect(recommendedIds).not.toContain('s1');
    expect(recommendedIds).not.toContain('s2');
  });

  it('should require authentication', async () => {
    const res = await request(app).get('/api/recommendations');
    expect(res.statusCode).toBe(401);
  });
}); 