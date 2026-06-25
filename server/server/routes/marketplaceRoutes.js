const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/products', marketplaceController.getAllProducts);
router.get('/products/:id', marketplaceController.getProductById);
router.post(
    '/cart/add',
    marketplaceController.addToCart
);

router.get(
    '/cart',
    marketplaceController.getCartItems
);

router.delete(
    '/cart/:id',
    marketplaceController.removeCartItem
);

router.put(
    '/cart/:id',
    marketplaceController.updateCartQuantity
);
router.post('/orders', marketplaceController.placeOrder);
router.get('/orders', marketplaceController.getMyOrders);
router.get(
    '/admin/orders',
    marketplaceController.getAllOrders
);

router.put(
    '/admin/orders/:id',
    marketplaceController.updateOrderStatus
);


module.exports = router;