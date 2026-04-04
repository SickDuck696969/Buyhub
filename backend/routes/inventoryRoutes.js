const express = require('express');
const router = express.Router();
const {
    getInventory,
    getInventoryByProductId,
    updateInventory,
} = require('../controllers/inventoryController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(protect, admin, getInventory);
router.route('/:productId').get(getInventoryByProductId).put(protect, admin, updateInventory);

module.exports = router;
