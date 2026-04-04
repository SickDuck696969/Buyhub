const Product = require('../schemas/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        let query = {};
        
        // Search by name (case-insensitive)
        if (req.query.search) {
            query.name = {
                $regex: req.query.search,
                $options: 'i',
            };
        }

        // Filter by category (category_id)
        if (req.query.category) {
            query.category_id = req.query.category;
        }

        let sort = {};
        // Sort by price
        if (req.query.sort === 'price_asc') {
            sort.price = 1;
        } else if (req.query.sort === 'price_desc') {
            sort.price = -1;
        } else {
            // Default sort newest first
            sort.createdAt = -1;
        }

        // Pagination/Limit
        let limit = req.query.limit ? parseInt(req.query.limit) : 0; // 0 means no limit in Mongoose
        
        const products = await Product.find(query).sort(sort).limit(limit).populate('category_id', 'name');
        res.json(products);
    } catch (error) {
        res.status(500);
        throw new Error('Server Error: ' + error.message);
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    const { name, price, description, main_image, images, brand_id, category_id } = req.body;

    const product = new Product({
        name,
        price,
        description,
        main_image,
        images,
        brand_id,
        category_id,
        user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    const { name, price, description, main_image, images, brand_id, category_id } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name;
        product.price = price;
        product.description = description;
        product.main_image = main_image;
        product.images = images;
        product.brand_id = brand_id;
        product.category_id = category_id;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
};


module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
