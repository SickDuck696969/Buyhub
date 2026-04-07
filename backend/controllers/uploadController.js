const path = require('path');

const buildUploadResponse = (req, res) => {
    if (!req.files || !req.files.length) {
        res.status(400);
        throw new Error('No images were uploaded.');
    }

    const files = req.files.map((file) => {
        const folder = path.basename(file.destination).replace(/\\/g, '/');
        return path.posix.join('/uploads', folder, file.filename);
    });

    res.status(201).json({
        message: 'Images uploaded successfully',
        file: files[0],
        files,
    });
};

const uploadProduct = (req, res) => {
    buildUploadResponse(req, res);
};

const uploadReview = (req, res) => {
    buildUploadResponse(req, res);
};

module.exports = {
    uploadProduct,
    uploadReview,
};
