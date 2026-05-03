const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const admin = await User.findOne({ email: 'admin@ego.com' });
    console.log("Is admin123?", await admin.comparePassword('admin123'));
    console.log("Is Ego@123?", await admin.comparePassword('Ego@123'));
    
    // Check if finding by identifier works
    const adminByName = await User.findOne({
        $or: [
            { email: 'admin@ego.com' },
            { name: 'admin@ego.com' }
        ]
    });
    console.log("Found by email identifier?", !!adminByName);

    const adminByWrongName = await User.findOne({
        $or: [
            { email: 'Admin' },
            { name: 'Admin' }
        ]
    });
    console.log("Found by 'Admin' identifier?", !!adminByWrongName);

    process.exit(0);
}).catch(console.error);
