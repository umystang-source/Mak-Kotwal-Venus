const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('role').optional().isIn(['user', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role = 'user' } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role`,
      [email, hashedPassword, name, role]
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login - Step 1: Validate credentials
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If 2FA is enabled, require TOTP verification
    if (user.two_factor_enabled && user.two_factor_secret) {
      return res.json({
        message: '2FA required',
        requires2FA: true,
        userId: user.id
      });
    }

    // Generate token if 2FA not enabled
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        two_factor_enabled: user.two_factor_enabled,
        visible_attributes: user.visible_attributes
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Verify 2FA TOTP Token
router.post('/verify-totp', [
  body('userId').isInt(),
  body('token').isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, token } = req.body;

    // Get user with 2FA secret
    const result = await pool.query(
      'SELECT id, email, name, role, two_factor_secret, visible_attributes FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    if (!user.two_factor_secret) {
      return res.status(400).json({ error: '2FA not set up for this user' });
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps before/after for clock skew
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid authentication code' });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        two_factor_enabled: true,
        visible_attributes: user.visible_attributes
      },
      token: jwtToken
    });
  } catch (error) {
    console.error('TOTP verification error:', error);
    res.status(500).json({ error: 'Server error during verification' });
  }
});

// Setup 2FA - Generate secret and QR code
router.post('/setup-2fa', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [req.user.id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.rows[0];

    // Generate new secret
    const secret = speakeasy.generateSecret({
      name: `MAK Kotwal Venus (${userData.email})`,
      issuer: 'MAK Kotwal Venus'
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    // Save secret to database (but don't enable 2FA yet)
    await pool.query(
      'UPDATE users SET two_factor_secret = $1 WHERE id = $2',
      [secret.base32, req.user.id]
    );

    res.json({
      message: '2FA setup initiated',
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: 'Server error during 2FA setup' });
  }
});

// Enable 2FA - Verify token and enable
router.post('/enable-2fa', authenticateToken, [
  body('token').isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;

    // Get user's 2FA secret
    const result = await pool.query(
      'SELECT two_factor_secret FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0 || !result.rows[0].two_factor_secret) {
      return res.status(400).json({ error: '2FA not set up. Please setup 2FA first.' });
    }

    const secret = result.rows[0].two_factor_secret;

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid authentication code' });
    }

    // Enable 2FA
    await pool.query(
      'UPDATE users SET two_factor_enabled = true WHERE id = $1',
      [req.user.id]
    );

    res.json({
      message: '2FA enabled successfully',
      two_factor_enabled: true
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Disable 2FA
router.post('/disable-2fa', authenticateToken, [
  body('token').isLength({ min: 6, max: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;

    // Get user's 2FA secret
    const result = await pool.query(
      'SELECT two_factor_secret FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0 || !result.rows[0].two_factor_secret) {
      return res.status(400).json({ error: '2FA not enabled' });
    }

    const secret = result.rows[0].two_factor_secret;

    // Verify the token before disabling
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid authentication code' });
    }

    // Disable 2FA and remove secret
    await pool.query(
      'UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL WHERE id = $1',
      [req.user.id]
    );

    res.json({
      message: '2FA disabled successfully',
      two_factor_enabled: false
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, two_factor_enabled, visible_attributes, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
