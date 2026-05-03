const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{ 
        product: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product',
            validate: {
                validator: function(v) {
                    // Allow ObjectId format or skip validation for demo data
                    return !v || /^[0-9a-fA-F]{24}$/.test(v);
                },
                message: 'Product ID must be a valid ObjectId'
            }
        },
        quantity: { type: Number, default: 1 }
    }],
    totalAmount: { type: Number, required: true },
    customization: { type: mongoose.Schema.Types.ObjectId, ref: 'Customization' },
    paymentMethod: { type: String, required: true, default: 'Cash on Delivery' },
    status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
    deliveryDetails: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        phone: { 
            type: String, 
            required: true,
            validate: {
                validator: function(v) {
                    // Remove all non-digit characters
                    const cleaned = v.replace(/\D/g, '');
                    
                    // Check if it's a valid phone number (10-15 digits)
                    if (cleaned.length < 10 || cleaned.length > 15) {
                        return false;
                    }
                    
                    // Check if it starts with valid country code or local format
                    const validPatterns = [
                        /^\d{10}$/, // 10-digit local numbers
                        /^\d{11}$/, // 11-digit numbers with country code
                        /^\d{12}$/, // 12-digit numbers
                        /^\d{13}$/, // 13-digit numbers
                        /^\d{14}$/, // 14-digit numbers
                        /^\d{15}$/, // 15-digit numbers
                        /^94\d{9}$/, // Sri Lanka format (94 + 9 digits)
                        /^1\d{10}$/, // US format (1 + 10 digits)
                        /^44\d{10}$/, // UK format (44 + 10 digits)
                    ];
                    
                    return validPatterns.some(pattern => pattern.test(cleaned));
                },
                message: 'Please enter a valid phone number (10-15 digits)'
            }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
