const express = require('express');
const router = express.Router();
const controller = require('../controllers/mediaController');
const auth = require('../middleware/authMiddleware');

// Upload image
router.post('/upload', auth, controller.uploadMiddleware, controller.uploadImage);

// Get photos by category
router.get('/photos/:category', auth, controller.getPhotosByCategory);

// Get category stats
router.get('/categories/stats', auth, controller.getCategoryStats);

module.exports = router;
