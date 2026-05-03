const PromoCode = require('../models/PromoCode');

exports.createPromo = async (req, res) => {
    try {
        const promo = new PromoCode(req.body);
        await promo.save();
        res.status(201).json(promo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.validatePromo = async (req, res) => {
    try {
        const promo = await PromoCode.findOne({
            code: { $regex: new RegExp(`^${req.params.code}$`, 'i') },
            isActive: true
        });
        if (!promo || promo.expiryDate < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired promo code' });
        }

        // Check Minimum Order Amount
        const subtotal = parseFloat(req.query.subtotal) || 0;
        if (subtotal < promo.minOrderAmount) {
            return res.status(400).json({ 
                message: `This code requires a minimum order of $${promo.minOrderAmount}. You need $${(promo.minOrderAmount - subtotal).toFixed(2)} more.` 
            });
        }

        // Return success with discount info
        res.json({ 
            valid: true,
            discountPercentage: promo.discountPercentage,
            message: `Promo code applied! ${promo.discountPercentage}% discount`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
