const express = require('express');
const router = express.Router();
const { uploadProduct, uploadReview } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/product', protect, admin, upload.array('images', 5), uploadProduct);
router.post('/review', protect, upload.array('images', 5), uploadReview);

module.exports = router;
