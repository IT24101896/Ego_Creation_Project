const express = require('express');
const router = express.Router();
const controller = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminMiddleware');

router.post('/', auth, controller.addReview);
router.get('/product/:productId', controller.getProductReviews);
router.get('/all', adminAuth, controller.getAllReviews);
router.put('/approve/:id', adminAuth, controller.approveReview);

module.exports = router;
