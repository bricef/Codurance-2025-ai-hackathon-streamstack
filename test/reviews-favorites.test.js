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

describe('Reviews and Favorites Endpoints', () => {
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
  });

  describe('Reviews', () => {
    beforeEach((done) => {
      db.run(`INSERT INTO netflix (show_id, type, title) VALUES ('s1', 'Movie', 'Test Movie')`, done);
    });

    it('should create a review', async () => {
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          show_id: 's1',
          rating: 5,
          review: 'Great movie!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id');
    });

    it('should get reviews for a title', async () => {
      // Create a review first
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          show_id: 's1',
          rating: 5,
          review: 'Great movie!'
        });

      const res = await request(app).get('/api/reviews/s1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('rating', 5);
      expect(res.body[0]).toHaveProperty('review', 'Great movie!');
    });

    it('should get average rating for a title', async () => {
      // Create multiple reviews
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          show_id: 's1',
          rating: 5,
          review: 'Great movie!'
        });

      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          show_id: 's1',
          rating: 3,
          review: 'Okay movie'
        });

      const res = await request(app).get('/api/reviews/s1/average');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('average_rating', 4);
    });

    it('should get user reviews', async () => {
      // Create a review
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          show_id: 's1',
          rating: 5,
          review: 'Great movie!'
        });

      const res = await request(app)
        .get('/api/reviews/user')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('rating', 5);
      expect(res.body[0]).toHaveProperty('review', 'Great movie!');
    });
  });

  describe('Favorites', () => {
    beforeEach((done) => {
      db.run(`INSERT INTO netflix (show_id, type, title) VALUES ('s1', 'Movie', 'Test Movie')`, done);
    });

    it('should add a title to favorites', async () => {
      const res = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({
          show_id: 's1'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id');
    });

    it('should get user favorites', async () => {
      // Add a favorite first
      await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({
          show_id: 's1'
        });

      const res = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('show_id', 's1');
    });

    it('should remove a title from favorites', async () => {
      // Add a favorite first
      await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${token}`)
        .send({
          show_id: 's1'
        });

      const res = await request(app)
        .delete('/api/favorites/s1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Removed from favorites');

      // Verify it's removed
      const favorites = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${token}`);

      expect(favorites.body).toHaveLength(0);
    });
  });
}); 