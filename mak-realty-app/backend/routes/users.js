const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, role, two_factor_enabled, is_visible, visible_attributes, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle user visibility (admin only)
router.patch('/:userId/visibility', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { visible } = req.body;

    const result = await pool.query(
      `UPDATE users SET is_visible = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, name, role, is_visible`,
      [visible, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: `User ${visible ? 'unhidden' : 'hidden'} successfully`,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Toggle user visibility error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user role (admin only)
router.patch('/:userId/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Prevent self-demotion
    if (parseInt(userId) === req.user.id && role === 'user') {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const result = await pool.query(
      `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, name, role`,
      [role, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user attribute visibility (admin only)
router.patch('/:userId/attributes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { visibleAttributes } = req.body;

    if (!visibleAttributes || typeof visibleAttributes !== 'object') {
      return res.status(400).json({ error: 'Invalid visibleAttributes format' });
    }

    const result = await pool.query(
      `UPDATE users SET visible_attributes = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, name, visible_attributes`,
      [JSON.stringify(visibleAttributes), userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User attribute visibility updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update attribute visibility error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent self-deletion
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, email, name',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create user (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, is_visible, created_at`,
      [email, hashedPassword, name, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
