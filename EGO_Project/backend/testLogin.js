const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testLogin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Test login with known working credentials
        const testUser = {
            email: 'jithmi@gmail.com',
            password: '123456'
        };

        console.log(`\n🔍 Testing login for: ${testUser.email}`);
        
        // Find user
        const user = await User.findOne({ 
            email: { $regex: new RegExp(`^${testUser.email}$`, 'i') } 
        });

        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log(`✅ User found: ${user.name} (${user.role})`);

        // Test password comparison
        const isMatch = await user.comparePassword(testUser.password);
        
        if (isMatch) {
            console.log('✅ Password matches - Login should work!');
            
            // Generate JWT token
            const jwt = require('jsonwebtoken');
            const token = jwt.sign(
                { id: user._id, role: user.role }, 
                process.env.JWT_SECRET || 'fallbackSecretKey', 
                { expiresIn: '1d' }
            );
            
            console.log(`🔑 JWT Token generated: ${token.substring(0, 50)}...`);
            console.log('\n📱 Use these credentials to login:');
            console.log(`   Email: ${testUser.email}`);
            console.log(`   Password: ${testUser.password}`);
            
        } else {
            console.log('❌ Password does not match');
        }

    } catch (error) {
        console.error('❌ Error testing login:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testLogin();
