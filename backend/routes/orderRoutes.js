const express = require('express');
const { placeOrder, getOrders } = require('../controllers/orderController');
const router = express.Router();

router.post('/place-order', placeOrder);
router.get('/orders', getOrders);

module.exports = router;
