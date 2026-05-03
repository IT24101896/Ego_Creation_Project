const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get all users
        const users = await User.find({});
        console.log(`\n📋 Found ${users.length} users in database:\n`);

        if (users.length === 0) {
            console.log('❌ No users found. You need to register first.');
            return;
        }

        users.forEach((user, index) => {
            console.log(`${index + 1}. 📧 Email: ${user.email}`);
            console.log(`   👤 Name: ${user.name}`);
            console.log(`   🔑 Role: ${user.role}`);
            console.log(`   📅 Created: ${user.createdAt.toLocaleDateString()}`);
            console.log(`   🔐 Password Hash: ${user.password ? '✅ Set' : '❌ Missing'}`);
            console.log('');
        });

        // Test login for each user
        console.log('🔍 Testing login credentials...\n');
        
        for (const user of users) {
            console.log(`👤 Testing login for: ${user.email}`);
            
            // Test common passwords
            const testPasswords = ['password', '123456', 'admin', 'test', user.email.split('@')[0]];
            
            let validPassword = null;
            for (const testPass of testPasswords) {
                const isMatch = await user.comparePassword(testPass);
                if (isMatch) {
                    validPassword = testPass;
                    break;
                }
            }
            
            if (validPassword) {
                console.log(`   ✅ Valid password found: "${validPassword}"`);
            } else {
                console.log(`   ❌ No common password works. You may need to reset password.`);
            }
            console.log('');
        }

        console.log('💡 If you can\'t login, try these credentials:');
        console.log('   • Check the exact email you used during registration');
        console.log('   • Try common passwords: password, 123456, admin, test');
        console.log('   • Or use the password reset functionality');

    } catch (error) {
        console.error('❌ Error checking users:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
