const Review = require('../models/Review');

exports.addReview = async (req, res) => {
    try {
        const { product, rating, comment } = req.body;
        const review = new Review({
            user: req.user.id,
            product,
            rating,
            comment
        });
        await review.save();
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId, isApproved: true }).populate('user', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().populate('user', 'name').populate('product', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.approveReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
