const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  handleGoogleCallback,
  handleAdminGoogleCallback,
  initiateStudentAuth,
  validateAdminKey,
  logout,
  getMe,
  completeProfile,
  registerLocal,
  loginLocal,
} = require('../controllers/authController');

const router = express.Router();

// ── Student / Recruiter Google OAuth ──────────────────────────────────────────
// Student flow — sets pendingRole=student in session before redirect
router.get('/google/student', initiateStudentAuth, passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

// Recruiter / company flow
router.get('/google/recruiter', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

// Shared callback for student & recruiter
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/auth/error` }),
  handleGoogleCallback
);

// ── Admin OAuth (hidden route) ─────────────────────────────────────────────────
// Step 1: Validate secret key (called from hidden admin login page)
router.post('/admin/verify-key',
  [body('secretKey').notEmpty().withMessage('Secret key is required.')],
  validate,
  validateAdminKey
);

// Step 2: After key verified, frontend redirects here to start OAuth
router.get('/admin/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
}));

// Admin-specific callback
router.get('/admin/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/admin/auth?error=1` }),
  handleAdminGoogleCallback
);

// ── General endpoints ──────────────────────────────────────────────────────────
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

router.post(
  '/complete-profile',
  authenticate,
  [body('student_id').trim().notEmpty().withMessage('Student ID is required.')],
  validate,
  completeProfile
);

// ── Local Auth ────────────────────────────────────────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role').isIn(['student', 'recruiter']).withMessage('Invalid role.'),
], validate, registerLocal);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
], validate, loginLocal);

module.exports = router;
