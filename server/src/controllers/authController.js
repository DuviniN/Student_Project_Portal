const { signToken, setTokenCookie, clearTokenCookie } = require('../utils/jwt');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Called after successful Google OAuth
const handleGoogleCallback = (req, res) => {
  const user = req.user;
  if (!user) {
    return res.redirect(`${process.env.CLIENT_URL}/auth/error?message=Authentication+failed`);
  }

  const token = signToken(user.id);
  setTokenCookie(res, token);

  // Students who just registered need to provide their student ID
  if (user.role === 'student' && !user.student_id) {
    return res.redirect(`${process.env.CLIENT_URL}/complete-profile`);
  }

  res.redirect(`${process.env.CLIENT_URL}/dashboard`);
};

// Admin Google OAuth callback
const handleAdminGoogleCallback = (req, res) => {
  const user = req.user;
  if (!user) {
    return res.redirect(
      `${process.env.CLIENT_URL}/admin/auth?error=Authentication+failed`
    );
  }

  const token = signToken(user.id);
  setTokenCookie(res, token);
  res.redirect(`${process.env.CLIENT_URL}/admin/dashboard`);
};

// Initiate student OAuth — set session flag
const initiateStudentAuth = (req, res, next) => {
  req.session.pendingRole = 'student';
  next();
};

// Validate admin secret key before initiating admin OAuth
const validateAdminKey = (req, res, next) => {
  const { secretKey } = req.body;
  if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ success: false, message: 'Invalid admin secret key.' });
  }
  req.session.adminAuthFlow = true;
  res.json({ success: true, message: 'Key verified. Redirecting to Google...' });
};

const logout = (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
};

const getMe = (req, res) => {
  const { id, name, email, profile_pic, role, student_id } = req.user;
  res.json({ success: true, user: { id, name, email, profile_pic, role, student_id } });
};

// Students complete their profile by providing student ID
const completeProfile = async (req, res) => {
  const pool = require('../config/db');
  const { student_id } = req.body;

  if (!student_id || typeof student_id !== 'string' || !student_id.trim()) {
    return res.status(422).json({ success: false, message: 'Student ID is required.' });
  }

  const sid = student_id.trim().toUpperCase();

  try {
    // Check uniqueness
    const existing = await pool.query(
      'SELECT id FROM users WHERE student_id = $1 AND id != $2',
      [sid, req.user.id]
    );
    if (existing.rows.length) {
      return res.status(409).json({ success: false, message: 'Student ID already in use.' });
    }

    await pool.query(
      'UPDATE users SET student_id = $1, updated_at = NOW() WHERE id = $2',
      [sid, req.user.id]
    );

    res.json({ success: true, message: 'Profile completed.' });
  } catch (err) {
    console.error('[completeProfile]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const registerLocal = async (req, res) => {
  try {
    const { name, email, password, role, student_id } = req.body;
    
    // Check if email exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }

    // Check student ID if role is student
    let sid = null;
    if (role === 'student' && student_id) {
      sid = student_id.trim().toUpperCase();
      const existingSid = await pool.query('SELECT id FROM users WHERE student_id = $1', [sid]);
      if (existingSid.rows.length) {
        return res.status(409).json({ success: false, message: 'Student ID already in use.' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const insertResult = await pool.query(
      `INSERT INTO users (name, email, password, role, student_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [name, email, hashedPassword, role, sid]
    );

    const userId = insertResult.rows[0].id;
    const token = signToken(userId);
    setTokenCookie(res, token);
    
    res.status(201).json({ success: true, message: 'Registration successful.' });
  } catch (err) {
    console.error('[registerLocal]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const loginLocal = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    if (!user.password) {
      return res.status(401).json({ success: false, message: 'Please login with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = signToken(user.id);
    setTokenCookie(res, token);

    res.json({ success: true, message: 'Login successful.' });
  } catch (err) {
    console.error('[loginLocal]', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  handleGoogleCallback,
  handleAdminGoogleCallback,
  initiateStudentAuth,
  validateAdminKey,
  logout,
  getMe,
  completeProfile,
  registerLocal,
  loginLocal,
};
