const fs = require('fs');
const multer = require('multer');
const path = require('path');

const uploadRoot = path.join(__dirname, '..', 'uploads');

const getUploadFolder = (req) => {
    if (req.path.includes('review')) {
        return 'reviews';
    }

    return 'products';
};

const sanitizeFileName = (fileName) => {
    const extension = path.extname(fileName).toLowerCase();
    const baseName = path
        .basename(fileName, extension)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);

    return `${baseName || 'image'}-${Date.now()}${extension}`;
};

const storage = multer.diskStorage({
    destination(req, file, cb) {
        const folder = getUploadFolder(req);
        const targetDirectory = path.join(uploadRoot, folder);

        fs.mkdirSync(targetDirectory, { recursive: true });
        cb(null, targetDirectory);
    },
    filename(req, file, cb) {
        cb(null, sanitizeFileName(file.originalname));
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
        return;
    }

    cb(new Error('Only JPEG, PNG, and WEBP images are allowed.'));
}

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter(req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;
