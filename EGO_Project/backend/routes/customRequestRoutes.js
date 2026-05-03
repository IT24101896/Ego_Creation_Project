const express = require('express');
const router = express.Router();
const controller = require('../controllers/customRequestController');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Public routes
router.post('/', auth, upload.single('referenceImage'), controller.createCustomRequest);
router.get('/myrequests', auth, controller.getUserCustomRequests);

// Admin routes
router.get('/admin/all', adminAuth, controller.getAllCustomRequests);
router.post('/admin/create', adminAuth, upload.single('referenceImage'), controller.createCustomRequestForCustomer);
router.put('/admin/:id/quote', adminAuth, controller.provideQuote);
router.put('/admin/:id/status', adminAuth, controller.updateRequestStatus);

// Customer response routes
router.put('/:id/respond', auth, controller.respondToQuote);

module.exports = router;
