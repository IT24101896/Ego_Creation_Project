const mongoose = require('mongoose');
const PromoCode = require('./models/PromoCode');
require('dotenv').config();

// Default promo codes that are instantly available to users
const defaultPromos = [
    {
        code: 'WELCOME10',
        discountPercentage: 10,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        minOrderAmount: 20,
        isActive: true
    },
    {
        code: 'SUMMER25',
        discountPercentage: 25,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        minOrderAmount: 50,
        isActive: true
    },
    {
        code: 'SAVE15',
        discountPercentage: 15,
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        minOrderAmount: 30,
        isActive: true
    },
    {
        code: 'SPECIAL20',
        discountPercentage: 20,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        minOrderAmount: 40,
        isActive: true
    },
    {
        code: 'FIRST5',
        discountPercentage: 5,
        expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days
        minOrderAmount: 10,
        isActive: true
    }
];

async function createDefaultPromos() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if default promos already exist
        const existingPromos = await PromoCode.find({
            code: { $in: defaultPromos.map(p => p.code) }
        });

        if (existingPromos.length > 0) {
            console.log('📋 Default promo codes already exist:');
            existingPromos.forEach(promo => {
                console.log(`   🎟️ ${promo.code}: ${promo.discountPercentage}% off (Min: $${promo.minOrderAmount})`);
            });
            return;
        }

        // Create default promo codes
        const createdPromos = await PromoCode.insertMany(defaultPromos);
        console.log('✅ Created default promo codes:');
        
        createdPromos.forEach(promo => {
            console.log(`   🎟️ ${promo.code}: ${promo.discountPercentage}% off (Min: $${promo.minOrderAmount})`);
        });

        console.log('\n🚀 These promo codes are now instantly available to users!');
        console.log('📱 Users can apply these codes in checkout without admin approval:');
        console.log('   • WELCOME10 (10% off, min $20)');
        console.log('   • SUMMER25 (25% off, min $50)');
        console.log('   • SAVE15 (15% off, min $30)');
        console.log('   • SPECIAL20 (20% off, min $40)');
        console.log('   • FIRST5 (5% off, min $10)');

    } catch (error) {
        console.error('❌ Error creating default promos:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createDefaultPromos();
