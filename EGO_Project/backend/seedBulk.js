const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const categories = [
    { name: 'Flowers', image: '/uploads/flower_bouquet_main.png', prefix: 'Fresh' },
    { name: 'Chocolates', image: '/uploads/chocolate_box_main.png', prefix: 'Gourmet' },
    { name: 'Toys', image: '/uploads/mini_toy_main.png', prefix: 'Mini' },
    { name: 'Valentine', image: '/uploads/valentine_card_main.png', prefix: 'Romantic' },
    { name: 'Birthday', image: '/uploads/birthday_card_main.png', prefix: 'Happy' },
    { name: 'Eco', image: '/uploads/sprout_pencils_product.png', prefix: 'Sustainable' }
];

const items = ['Gift Set', 'Surprise', 'Bundle', 'Special', 'Luxury', 'Classic', 'Deluxe', 'Premium', 'Artisan', 'Handmade'];

const seedBulk = async () => {
    const products = [];
    for (let i = 1; i <= 60; i++) {
        const cat = categories[i % categories.length];
        const item = items[Math.floor(Math.random() * items.length)];
        
        products.push({
            name: `${cat.prefix} ${cat.name} ${item} #${i}`,
            description: `A beautiful ${cat.name.toLowerCase()} item from our premium collection. Perfect for any occasion.`,
            price: parseFloat((Math.random() * (100 - 5) + 5).toFixed(2)),
            category: cat.name,
            stock: Math.floor(Math.random() * 50) + 10,
            imageUrl: cat.image
        });
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🌱 Bulk Seeding 60+ Items...');
        await Product.deleteMany({});
        await Product.insertMany(products);
        console.log('✅ Success: 60 Premium Items Added to Catalog!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedBulk();
