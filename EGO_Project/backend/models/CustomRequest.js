const mongoose = require('mongoose');

const customRequestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Item Details
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    referenceImage: { type: String },
    
    // Budget
    budgetMin: { type: Number, required: true },
    budgetMax: { type: Number, required: true },
    
    // Personalization
    personalMessage: { type: String },
    fontStyle: { type: String, default: 'Elegant' },
    colorCode: { type: String, default: 'Gold' },
    
    // Request Management
    urgency: { type: String, enum: ['Normal', 'Urgent', 'Express'], default: 'Normal' },
    status: { type: String, enum: ['Pending', 'Under Review', 'Quoted', 'Approved', 'Rejected', 'In Progress', 'Completed'], default: 'Pending' },
    
    // Admin Response
    adminNotes: { type: String },
    quotedPrice: { type: Number },
    estimatedDays: { type: Number },
    requiresMaterials: { type: [String] },
    
    // Customer Response
    customerResponse: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    
    // Order Link
    linkedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
    
}, { timestamps: true });

module.exports = mongoose.model('CustomRequest', customRequestSchema);
