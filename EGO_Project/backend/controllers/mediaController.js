const Media = require('../models/Media');
const multer = require('multer');
const path = require('path');

// Multer Setup
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

exports.uploadMiddleware = upload.single('image');

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        
        const { category, title, description } = req.body;
        
        const media = new Media({
            userId: req.user?.id,
            fileName: req.file.filename,
            fileUrl: `/uploads/${req.file.filename}`,
            fileType: req.file.mimetype,
            category: category || 'General',
            title: title || '',
            description: description || ''
        });
        await media.save();

        res.status(201).json({ url: media.fileUrl, media });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all photos by category
exports.getPhotosByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const userId = req.user?.id;
        
        let query = {};
        if (category && category !== 'all') {
            query.category = category;
        }
        if (userId) {
            query.userId = userId;
        }
        
        const photos = await Media.find(query)
            .sort('-createdAt')
            .select('fileName fileUrl category title description createdAt');
            
        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all categories with photo counts
exports.getCategoryStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        const matchStage = userId ? { userId } : {};
        
        const stats = await Media.aggregate([
            { $match: matchStage },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        const categories = [
            'Gift Ideas', 'Inspirations', 'Reference Photos', 'Custom Samples', 'General'
        ].map(cat => {
            const found = stats.find(s => s._id === cat);
            return { category: cat, count: found ? found.count : 0 };
        });
        
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
