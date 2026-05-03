const mongoose = require('mongoose');
const PromoCode = require('./models/PromoCode');
require('dotenv').config();

// Sample promo codes for testing
const samplePromos = [
    {
        code: 'SUMMER20',
        discountPercentage: 20,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        minOrderAmount: 50,
        isActive: true
    },
    {
        code: 'WELCOME10',
        discountPercentage: 10,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        minOrderAmount: 25,
        isActive: true
    },
    {
        code: 'SPECIAL25',
        discountPercentage: 25,
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        minOrderAmount: 100,
        isActive: true
    },
    {
        code: 'SAVE15',
        discountPercentage: 15,
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        minOrderAmount: 30,
        isActive: true
    },
    {
        code: 'FIRST5',
        discountPercentage: 5,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        minOrderAmount: 10,
        isActive: true
    }
];

async function createSamplePromos() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing promo codes
        await PromoCode.deleteMany({});
        console.log('🗑️ Cleared existing promo codes');

        // Create sample promo codes
        const createdPromos = await PromoCode.insertMany(samplePromos);
        console.log('✅ Created sample promo codes:');
        
        createdPromos.forEach(promo => {
            console.log(`   🎟️ ${promo.code}: ${promo.discountPercentage}% off (Min: $${promo.minOrderAmount})`);
        });

        console.log('\n🚀 Ready to test promo codes in checkout!');
        console.log('📱 Try these codes in the checkout screen:');
        console.log('   • SUMMER20 (20% off, min $50)');
        console.log('   • WELCOME10 (10% off, min $25)');
        console.log('   • SPECIAL25 (25% off, min $100)');
        console.log('   • SAVE15 (15% off, min $30)');
        console.log('   • FIRST5 (5% off, min $10)');

    } catch (error) {
        console.error('❌ Error creating sample promos:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createSamplePromos();
