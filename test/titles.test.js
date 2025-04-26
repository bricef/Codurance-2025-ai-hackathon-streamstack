const request = require('supertest');
const { db, initializeTestDb, cleanupTestDb } = require('./setup');
const app = require('../server');

beforeAll(async () => {
  await initializeTestDb();
});

afterAll(async () => {
  await cleanupTestDb();
});

describe('Title Endpoints', () => {
  beforeEach((done) => {
    db.serialize(() => {
      db.run('DELETE FROM netflix');
      const stmt = db.prepare(`INSERT INTO netflix (
        show_id, type, title, director, rating, release_year, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      
      stmt.run('s1', 'Movie', 'Test Movie 1', 'Test Director', 'PG-13', '2020', 'Test Description 1');
      stmt.run('s2', 'TV Show', 'Test Show 1', 'Different Director', 'TV-MA', '2021', 'Test Description 2');
      stmt.finalize(done);
    });
  });

  describe('GET /api/titles', () => {
    it('should get all titles', async () => {
      const res = await request(app).get('/api/titles');
      expect(res.statusCode).toBe(200);
      expect(res.body.titles).toHaveLength(2);
    });

    it('should filter titles by director', async () => {
      const res = await request(app)
        .get('/api/titles')
        .query({ director: 'Test Director' });

      expect(res.statusCode).toBe(200);
      expect(res.body.titles).toHaveLength(1);
      expect(res.body.titles[0].director).toBe('Test Director');
    });

    it('should filter titles by rating', async () => {
      const res = await request(app)
        .get('/api/titles')
        .query({ rating: 'TV-MA' });

      expect(res.statusCode).toBe(200);
      expect(res.body.titles).toHaveLength(1);
      expect(res.body.titles[0].rating).toBe('TV-MA');
    });

    it('should sort titles by release year', async () => {
      const res = await request(app)
        .get('/api/titles')
        .query({ sortBy: 'release_year', sortOrder: 'desc' });

      expect(res.statusCode).toBe(200);
      expect(res.body.titles).toHaveLength(2);
      expect(res.body.titles[0].release_year).toBe('2021');
    });

    it('should search titles by title', async () => {
      const res = await request(app)
        .get('/api/titles')
        .query({ search: 'Movie' });

      expect(res.statusCode).toBe(200);
      expect(res.body.titles).toHaveLength(1);
      expect(res.body.titles[0].title).toBe('Test Movie 1');
    });
  });

  describe('GET /api/titles/:id', () => {
    it('should get a title by id', async () => {
      const res = await request(app).get('/api/titles/s1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('title', 'Test Movie 1');
    });

    it('should return 404 for non-existent title', async () => {
      const res = await request(app).get('/api/titles/nonexistent');
      expect(res.statusCode).toBe(404);
    });
  });
}); 