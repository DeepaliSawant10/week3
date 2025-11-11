const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server'); // Path to server.js
const User = require('../../src/models/User'); // Path to User.js

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
//test comment
describe('POST /api/auth/signup', () => {
it('To check sign up for a new user and should return 201 with data', async () => {
    // Check if the user already exists
    const existingUser = await User.findOne({ email: 'ds83110n@pace.edu' });

    if (existingUser) {
      // If the user already exists, return a 409 status
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Deepali Sawant',
          username: 'deepalisawant',
          email: 'ds83110n@pace.edu',
          password: 'Password2025',
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User already exists');
    } else {
      // If the user doesn't exist, do sign up
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Deepali Sawant',
          username: 'deepalisawant',
          email: 'ds83110n@pace.edu',
          password: 'Password2025',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Deepali Sawant');
    }
});

  it('To check 400 is returned if required fields are missing', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Deepali Sawant',
        username: 'deepalisawant', //case to check missing email and password
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('All fields are required');
  });

  it('To check 409 is returned if the email or username already exists', async () => {
    // Create a user first
    await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Dee Sawant',
        username: 'dee_sawant',
        email: 'deesawant@gmail.com',
        password: 'Test2025',
      });

    // Create another user with same details
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Dee Sawant',
        username: 'dee_sawant',
        email: 'deesawant@gmail.com',
        password: 'Test2025',
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('User already exists');
  });
});
