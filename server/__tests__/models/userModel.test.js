const User = require('../../models/userModel');
const { generateTestUser } = require('../helpers/testUtils');

describe('User Model Test', () => {
  it('should create & save user successfully', async () => {
    const user = await generateTestUser();
    expect(user._id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
    expect(user.role).toBe('user');
  });

  it('should fail to save user without required fields', async () => {
    const userWithoutRequiredField = new User({ name: 'Test User' });
    let err;
    try {
      await userWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
  });

  it('should fail to save user with invalid email', async () => {
    const userWithInvalidEmail = new User({
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123',
    });
    let err;
    try {
      await userWithInvalidEmail.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
  });

  it('should create admin user successfully', async () => {
    const adminUser = await generateTestUser('admin');
    expect(adminUser.role).toBe('admin');
  });

  it('should hash password before saving', async () => {
    const user = await generateTestUser();
    expect(user.password).not.toBe('password123');
  });
});
