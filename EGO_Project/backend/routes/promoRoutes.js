const express = require('express');
const router = express.Router();
const controller = require('../controllers/promoController');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminMiddleware');

router.post('/', adminAuth, controller.createPromo);
router.get('/validate/:code', auth, controller.validatePromo);

module.exports = router;
