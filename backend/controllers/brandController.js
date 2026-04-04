const Brand = require('../schemas/Brand');

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = async (req, res) => {
    try {
        const brands = await Brand.find({}).sort({ createdAt: -1 });
        res.json(brands);
    } catch (error) {
        res.status(500);
        throw new Error('Server Error');
    }
};

// @desc    Get single brand
// @route   GET /api/brands/:id
// @access  Public
const getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);

        if (brand) {
            res.json(brand);
        } else {
            res.status(404);
            throw new Error('Brand not found');
        }
    } catch (error) {
        res.status(500);
        throw new Error(error.message || 'Server Error');
    }
};

// @desc    Create a brand
// @route   POST /api/brands
// @access  Private/Admin
const createBrand = async (req, res) => {
    try {
        const { name, description } = req.body;

        const brandExists = await Brand.findOne({ name });

        if (brandExists) {
            res.status(400);
            throw new Error('Brand already exists');
        }

        const brand = new Brand({
            name,
            description,
        });

        const createdBrand = await brand.save();
        res.status(201).json(createdBrand);
    } catch (error) {
        res.status(500);
        throw new Error(error.message || 'Server Error');
    }
};

// @desc    Update a brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
const updateBrand = async (req, res) => {
    try {
        const { name, description } = req.body;

        const brand = await Brand.findById(req.params.id);

        if (brand) {
            brand.name = name || brand.name;
            brand.description = description || brand.description;

            const updatedBrand = await brand.save();
            res.json(updatedBrand);
        } else {
            res.status(404);
            throw new Error('Brand not found');
        }
    } catch (error) {
        res.status(500);
        throw new Error(error.message || 'Server Error');
    }
};

// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
const deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);

        if (brand) {
            await brand.deleteOne();
            res.json({ message: 'Brand removed' });
        } else {
            res.status(404);
            throw new Error('Brand not found');
        }
    } catch (error) {
        res.status(500);
        throw new Error(error.message || 'Server Error');
    }
};

module.exports = {
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
};
