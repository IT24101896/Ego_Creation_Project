const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Checking for admin user...');
        
        const existingAdmin = await User.findOne({ email: 'admin@ego.com' });
        if (existingAdmin) {
            console.log('Admin user already exists. Updating password to "admin123"...');
            existingAdmin.password = 'admin123';
            existingAdmin.role = 'admin';
            await existingAdmin.save();
        } else {
            const admin = new User({
                name: 'EGO Admin',
                email: 'admin@ego.com',
                password: 'admin123',
                role: 'admin'
            });
            await admin.save();
            console.log('✅ Success: Admin user created!');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
