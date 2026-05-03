const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String },
    entityType: { type: String, enum: ['product', 'customization', 'user'] },
    category: { 
        type: String, 
        enum: ['Gift Ideas', 'Inspirations', 'Reference Photos', 'Custom Samples', 'General'], 
        default: 'General' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Media', mediaSchema);
