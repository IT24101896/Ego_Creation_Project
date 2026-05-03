const express = require('express');
const router = express.Router();
const { register, login, getAllUsers, registerAdmin, forgotPassword } = require('../controllers/authController');

// @route   POST api/auth/register
router.post('/register', register);

// @route   POST api/auth/login
router.post('/login', login);

// @route   GET api/auth/users
router.get('/users', getAllUsers);

// @route   POST api/auth/admin
router.post('/admin', registerAdmin);

// @route   POST api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

module.exports = router;