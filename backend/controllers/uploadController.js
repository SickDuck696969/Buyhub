const uploadProduct = (req, res) => {
    res.status(201).json({
        message: 'Images uploaded successfully',
        files: req.files.map(file => file.path),
    });
};

const uploadReview = (req, res) => {
    res.status(201).json({
        message: 'Images uploaded successfully',
        files: req.files.map(file => file.path),
    });
};

module.exports = {
    uploadProduct,
    uploadReview,
};
