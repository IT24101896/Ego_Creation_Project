const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
    try {
        const { products, totalAmount, paymentMethod, customizationId } = req.body;
        
        // Convert product IDs to proper ObjectId format if they're valid 24-char hex strings
        const processedProducts = products.map(item => ({
            product: item.product,
            quantity: item.quantity || 1
        }));
        
        const order = new Order({
            user: req.user.id,
            products: processedProducts,
            totalAmount,
            paymentMethod,
            customization: customizationId
        });
        await order.save();

        // Also update the customization record to link to this order
        if (customizationId) {
            const Customization = require('../models/Customization');
            await Customization.findByIdAndUpdate(customizationId, { order: order._id });
        }

        res.status(201).json(order);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('products.product')
            .populate('customization')
            .sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('products.product')
            .populate('customization')
            .sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Check if order belongs to user
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }
        
        // Only allow cancellation of pending orders
        if (order.status !== 'Pending') {
            return res.status(400).json({ message: 'Can only cancel pending orders' });
        }
        
        order.status = 'Cancelled';
        await order.save();
        
        res.json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create order from accepted custom request
exports.createOrderFromCustomRequest = async (req, res) => {
    try {
        const { customRequestId } = req.body;
        
        const CustomRequest = require('../models/CustomRequest');
        const customRequest = await CustomRequest.findById(customRequestId);
        
        if (!customRequest) {
            return res.status(404).json({ message: 'Custom request not found' });
        }
        
        // Check if request belongs to user and is approved
        if (customRequest.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        if (customRequest.customerResponse !== 'Accepted') {
            return res.status(400).json({ message: 'Custom request not accepted' });
        }
        
        // Create a mock product for the custom item
        const mockProductId = '507f1f77bcf86cd799439011'; // Fixed ObjectId for custom items
        
        const order = new Order({
            user: req.user.id,
            products: [{
                product: mockProductId,
                quantity: 1
            }],
            totalAmount: customRequest.quotedPrice,
            paymentMethod: 'Cash on Delivery',
            status: 'Processing', // Start as processing since admin already approved
            customization: customRequest._id
        });
        
        await order.save();
        
        // Update custom request status
        customRequest.status = 'In Progress';
        customRequest.linkedOrder = order._id;
        await customRequest.save();
        
        res.status(201).json(order);
    } catch (error) {
        console.error('Order creation from custom request error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
