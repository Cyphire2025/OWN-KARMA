require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const products = [
    {
        title: 'DIVINE',
        tagline: 'Beyond Human Understanding',
        description: 'A hoodie that transcends the ordinary.',
        price: 8900, // $89.00
        themeColor: '#646464ff',
        glowColor: '255, 215, 0', // Gold
        categoryName: 'Hoodies',
        images: [{ url: '/backgrounds/1.png' }] // Placeholder, update locally if needed
    },
    {
        title: "KARMA'S EYE",
        tagline: 'Witness To Every Action',
        description: 'The eye that sees all.',
        price: 8500,
        themeColor: '#646464ff',
        glowColor: '245, 222, 179', // Cream
        categoryName: 'Hoodies',
        images: [{ url: '/backgrounds/2.png' }]
    },
    {
        title: 'DESTINY',
        tagline: 'Written In The Stars',
        description: 'Your path is already charted.',
        price: 4500,
        themeColor: '#646464ff',
        glowColor: '255, 255, 255', // White
        categoryName: 'T-Shirts',
        images: [{ url: '/backgrounds/3.png' }]
    },
    {
        title: 'BROKEN HOURGLASS',
        tagline: "Time's Final Surrender",
        description: 'Time waits for no one.',
        price: 5000,
        themeColor: '#646464ff',
        glowColor: '139, 69, 19', // Brown
        categoryName: 'T-Shirts',
        images: [{ url: '/backgrounds/4.png' }]
    }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ownkarma')
    .then(async () => {
        console.log('Connected to MongoDB');

        // Clear existing data
        await Product.deleteMany({});
        await Category.deleteMany({});

        // Create Categories
        const hoodiesCat = await new Category({ name: 'Hoodies', description: 'Premium Hoodies' }).save();
        const tshirtsCat = await new Category({ name: 'T-Shirts', description: 'Luxury T-Shirts' }).save();

        // Add more categories as requested (4 total)
        await new Category({ name: 'Accessories', description: 'Exclusive Accessories' }).save();
        await new Category({ name: 'Special Editions', description: 'Limited drops' }).save();

        console.log('Categories created');

        // Create Products
        for (const p of products) {
            const category = p.categoryName === 'Hoodies' ? hoodiesCat : tshirtsCat;
            const product = new Product({
                ...p,
                category: category._id,
                variants: [
                    { color: 'Black', size: 'S', stock: 10 },
                    { color: 'Black', size: 'M', stock: 10 },
                    { color: 'Black', size: 'L', stock: 10 }
                ]
            });
            await product.save();
        }

        console.log('Products seeded');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
