const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const role = email.toLowerCase() === 'admin@ego.com' ? 'admin' : 'user';
        const user = new User({ name, email, password, role });
        await user.save();

        res.status(201).json({ message: 'User registered successfully', role });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        // Search by email or name (case-insensitive strict match)
        const user = await User.findOne({
            $or: [
                { email: { $regex: new RegExp(`^${identifier}$`, 'i') } },
                { name: { $regex: new RegExp(`^${identifier}$`, 'i') } }
            ]
        });
        if (!user) return res.status(400).json({ message: 'Invalid credentials - User not found' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallbackSecretKey', { expiresIn: '1d' });

        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

exports.registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const user = new User({ name, email, password, role: 'admin' });
        await user.save();

        res.status(201).json({ message: 'Admin user created successfully' });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'No account found with that email' });

        user.password = 'Ego@123';
        user.markModified('password');
        await user.save();

        res.json({ message: 'Password has been reset to: Ego@123' });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};
