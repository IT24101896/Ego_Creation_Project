const express = require('express');
const router = express.Router();
const controller = require('../controllers/customizationController');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', auth, upload.single('image'), controller.createCustomization);
router.get('/mycustoms', auth, controller.getUserCustomizations);
router.get('/:orderId', auth, controller.getCustomizationByOrder);

// Admin approval routes
router.get('/admin/pending', adminAuth, controller.getPendingCustomizations);
router.put('/admin/:id/approve', adminAuth, controller.approveCustomization);
router.put('/admin/:id/reject', adminAuth, controller.rejectCustomization);
router.put('/admin/:id/price-update', adminAuth, controller.requestPriceUpdate);

module.exports = router;
