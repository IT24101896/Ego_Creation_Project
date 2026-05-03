const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const sampleProducts = [
    {
        name: 'Eco Sprout Pencils',
        description: 'Sustainable pencils that grow into flowers.',
        price: 12.00,
        category: 'Stationary',
        stock: 150,
        imageUrl: '/uploads/sprout_pencils_product.png'
    },
    {
        name: 'Glow Magic Jar',
        description: 'Jar filled with warm LED fairy lights.',
        price: 45.00,
        category: 'Decor',
        stock: 30,
        imageUrl: '/uploads/magic_jar_product.png'
    },
    {
        name: 'Custom Art Mug',
        description: 'High quality ceramic mug with custom prints.',
        price: 18.00,
        category: 'Kitchen',
        stock: 100,
        imageUrl: '/uploads/chocolate_box_main.png'
    },
    {
        name: 'Scented Candle Set',
        description: 'Handmade soy wax candle with lavender scent.',
        price: 25.00,
        category: 'Home',
        stock: 50,
        imageUrl: '/uploads/flower_bouquet_main.png'
    },
    {
        name: 'Valentine Special Box',
        description: 'Real preserved red rose in a gift box.',
        price: 85.00,
        category: 'Flowers',
        stock: 20,
        imageUrl: '/uploads/valentine_card_main.png'
    },
    {
        name: 'Memory Box Luxe',
        description: 'Luxury wooden box for your memories.',
        price: 78.00,
        category: 'Gifts',
        stock: 15,
        imageUrl: '/uploads/memory_box.png'
    },
    {
        name: 'Birthday Surprise Pack',
        description: 'Colourful birthday card and mini gifts.',
        price: 22.00,
        category: 'Birthday',
        stock: 60,
        imageUrl: '/uploads/birthday_card_main.png'
    },
    {
        name: 'Mini Toy Collection',
        description: 'Cute collectible toy figures set.',
        price: 35.00,
        category: 'Toys',
        stock: 40,
        imageUrl: '/uploads/mini_toy_main.png'
    }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('🌱 Seeding expanded catalog...');
        await Product.deleteMany({});
        await Product.insertMany(sampleProducts);
        console.log('✅ Success: 6 Diverse Items Added!');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
