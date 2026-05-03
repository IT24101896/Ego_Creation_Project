const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminMiddleware');

router.post('/', auth, controller.createOrder);
router.get('/myorders', auth, controller.getUserOrders);
router.get('/all', adminAuth, controller.getAllOrders);
router.put('/:id/status', adminAuth, controller.updateOrderStatus);
router.put('/:id/cancel', auth, controller.cancelOrder);

// Create order from custom request
router.post('/create-from-custom-request', auth, controller.createOrderFromCustomRequest);

module.exports = router;
