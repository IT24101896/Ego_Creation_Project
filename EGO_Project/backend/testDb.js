const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const users = await User.find();
    console.log("USERS IN DB:", users.map(u => ({ email: u.email, name: u.name, pass: u.password, role: u.role })));
    process.exit(0);
}).catch(console.error);
