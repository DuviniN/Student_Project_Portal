const express = require('express');
const { param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, requireRole, optionalAuth } = require('../middleware/auth');
const { getUserProfile, getUserProjects, followUser, getAllUsers } = require('../controllers/userController');

const router = express.Router();

router.get('/', authenticate, requireRole('admin'), getAllUsers);

router.get('/:id',
  optionalAuth,
  param('id').isInt(),
  validate,
  getUserProfile
);

router.get('/:id/projects',
  optionalAuth,
  param('id').isInt(),
  validate,
  getUserProjects
);

router.post('/:id/follow',
  authenticate,
  param('id').isInt(),
  validate,
  followUser
);

module.exports = router;
