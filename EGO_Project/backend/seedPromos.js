const mongoose = require('mongoose');
const PromoCode = require('./models/PromoCode');
require('dotenv').config();

const codes = [
    { code: 'EGO2026', discountPercentage: 20, expiryDate: new Date('2026-12-31'), isActive: true },
    { code: 'EXPIRED', discountPercentage: 10, expiryDate: new Date('2024-01-01'), isActive: true },
    { code: 'WIN100', discountPercentage: 15, expiryDate: new Date('2026-12-31'), minOrderAmount: 100, isActive: true },
    { code: 'GIFT50', discountPercentage: 50, expiryDate: new Date('2026-06-01'), isActive: true }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('🎟️ Seeding Promo Codes...');
        await PromoCode.deleteMany({});
        await PromoCode.insertMany(codes);
        console.log('✅ Success: Promo Codes Added!');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
