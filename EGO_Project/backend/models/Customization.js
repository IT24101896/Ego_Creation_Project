const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // Now Optional
    personalizedMessage: { type: String }, // Renamed from 'message' to match controller
    fontStyle: { type: String, default: 'Standard' },
    colorCode: { type: String, default: 'Black' },
    theme: { type: String, default: 'Classic' },
    customImage: { type: String },
    // Admin approval fields
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Requires Price Update'], default: 'Pending' },
    adminNotes: { type: String },
    adjustedPrice: { type: Number },
    originalPrice: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Customization', customizationSchema);
