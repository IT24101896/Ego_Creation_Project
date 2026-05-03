const CustomRequest = require('../models/CustomRequest');

// Create new custom request
exports.createCustomRequest = async (req, res) => {
    try {
        const {
            itemName, category, description, budgetMin, budgetMax,
            personalMessage, fontStyle, colorCode, urgency
        } = req.body;
        
        const referenceImage = req.file ? `/uploads/${req.file.filename}` : null;

        const customRequest = new CustomRequest({
            user: req.user.id,
            itemName,
            category,
            description,
            referenceImage,
            budgetMin: parseFloat(budgetMin),
            budgetMax: parseFloat(budgetMax),
            personalMessage,
            fontStyle,
            colorCode,
            urgency
        });

        await customRequest.save();
        res.status(201).json(customRequest);
    } catch (error) {
        console.error('Custom request creation error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Get all custom requests for admin
exports.getAllCustomRequests = async (req, res) => {
    try {
        const requests = await CustomRequest.find()
            .populate('user', 'name email')
            .sort('-createdAt');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's custom requests
exports.getUserCustomRequests = async (req, res) => {
    try {
        const requests = await CustomRequest.find({ user: req.user.id })
            .sort('-createdAt');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Provide quote/feedback
exports.provideQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const { quotedPrice, estimatedDays, adminNotes, requiresMaterials, status } = req.body;
        
        const request = await CustomRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Custom request not found' });
        }
        
        request.quotedPrice = parseFloat(quotedPrice);
        request.estimatedDays = parseInt(estimatedDays);
        request.adminNotes = adminNotes;
        request.requiresMaterials = requiresMaterials || [];
        request.status = status || 'Quoted';
        
        await request.save();
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Customer: Accept/Reject quote
exports.respondToQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const { customerResponse } = req.body;
        
        const request = await CustomRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Custom request not found' });
        }
        
        // Check if request belongs to user
        if (request.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        request.customerResponse = customerResponse;
        
        if (customerResponse === 'Accepted') {
            request.status = 'Approved';
        } else if (customerResponse === 'Rejected') {
            request.status = 'Rejected';
        }
        
        await request.save();
        res.json({ message: `Quote ${customerResponse.toLowerCase()}`, request });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Create custom request for customer
exports.createCustomRequestForCustomer = async (req, res) => {
    try {
        const {
            customerEmail, customerName, itemName, category, description,
            basePrice, urgency, personalMessage, fontStyle, colorCode
        } = req.body;
        
        const referenceImage = req.file ? `/uploads/${req.file.filename}` : null;

        // Find or create user (simplified - in production you'd have proper user lookup)
        const User = require('../models/User');
        let user = await User.findOne({ email: customerEmail });
        
        if (!user) {
            // Create a basic user account for the customer
            user = new User({
                name: customerName,
                email: customerEmail,
                password: 'tempPassword123', // Would send email with setup link
                role: 'user'
            });
            await user.save();
        }

        const customRequest = new CustomRequest({
            user: user._id,
            itemName,
            category,
            description,
            referenceImage,
            budgetMin: Math.floor(basePrice * 0.8),
            budgetMax: Math.ceil(basePrice * 1.2),
            quotedPrice: parseFloat(basePrice),
            estimatedDays: urgency === 'Express' ? 2 : urgency === 'Urgent' ? 5 : 7,
            personalMessage,
            fontStyle,
            colorCode,
            urgency,
            status: 'Quoted', // Admin-initiated requests start as quoted
            adminNotes: 'Custom item created by admin based on available materials and expertise.',
            customerResponse: 'Pending'
        });

        await customRequest.save();
        
        // Populate user info for response
        await customRequest.populate('user', 'name email');
        
        res.status(201).json(customRequest);
    } catch (error) {
        console.error('Admin custom request creation error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const request = await CustomRequest.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        ).populate('user', 'name email');
        
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
