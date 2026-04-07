const Category = require('../schemas/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (category) {
            res.json(category);
        } else {
            res.status(404);
            throw new Error('Category not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
    try {
        const name = String(req.body.name || '').trim();
        const description = String(req.body.description || '').trim();

        if (!name) {
            res.status(400);
            throw new Error('Category name is required');
        }

        const categoryExists = await Category.findOne({ name });

        if (categoryExists) {
            res.status(409);
            throw new Error('Category already exists');
        }

        const category = new Category({
            name,
            description,
        });

        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    } catch (error) {
        if (error.code === 11000) {
            res.status(409);
            return next(new Error('Category already exists'));
        }

        next(error);
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
    try {
        const name = req.body.name ? String(req.body.name).trim() : '';
        const description = req.body.description !== undefined
            ? String(req.body.description).trim()
            : undefined;

        const category = await Category.findById(req.params.id);

        if (category) {
            if (name) {
                const categoryExists = await Category.findOne({
                    name,
                    _id: { $ne: category._id },
                });

                if (categoryExists) {
                    res.status(409);
                    throw new Error('Category already exists');
                }
            }

            category.name = name || category.name;
            if (description !== undefined) {
                category.description = description;
            }

            const updatedCategory = await category.save();
            res.json(updatedCategory);
        } else {
            res.status(404);
            throw new Error('Category not found');
        }
    } catch (error) {
        if (error.code === 11000) {
            res.status(409);
            return next(new Error('Category already exists'));
        }

        next(error);
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (category) {
            await category.deleteOne();
            res.json({ message: 'Category removed' });
        } else {
            res.status(404);
            throw new Error('Category not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
