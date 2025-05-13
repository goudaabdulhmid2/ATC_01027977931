const request = require('supertest');
const app = require('../../app');
const User = require('../../models/userModel');
const { generateTestUser } = require('../helpers/testUtils');

describe('Auth API Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
      expect(res.body.token).toBeDefined();
    });

    it('should fail to register with existing email', async () => {
      await generateTestUser();

      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Another User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await generateTestUser();
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('should fail to login with incorrect password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toBe(401);
    });

    it('should fail to login with non-existent email', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(401);
    });
  });
});
