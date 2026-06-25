const { Product, ProductCategory, Order, OrderItem, Cart, sequelize } = require('../models');


exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            where: {
            },
            include: [{
                model: ProductCategory,
                attributes: ['category_name']
            }],
            order: [['created_at', 'DESC']]
        });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching products.' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product_id = req.params.id;
        const product = await Product.findByPk(product_id, {
            include: [{ model: ProductCategory, attributes: ['category_name'] }]
        });

        if (!product) return res.status(404).json({ message: 'Product not found.' });
        
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching product details.' });
    }
};

exports.placeOrder = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        console.log(req.body);
        const user_id = req.user.user_id;
        const {
            cartItems,
            address,
            phone,
            payment_method
        } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart cannot be empty.' });
        }

        let total_amount = 0;
        const processedItems = [];

        for (let item of cartItems) {
            const product = await Product.findByPk(item.product_id, { transaction: t });

            if (!product) {
                throw new Error(`Product ID ${item.product_id} not found.`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.product_name}. Only ${product.stock} left.`);
            }

            const itemTotal = product.price * item.quantity;
            total_amount += itemTotal;

            processedItems.push({
                product_id: product.product_id,
                quantity: item.quantity,
                price: product.price 
            });

            await product.update({ stock: product.stock - item.quantity }, { transaction: t });
        }

        const order = await Order.create({

            user_id,
        
            total_amount,
        
            order_status: 'Pending',
        
            address,
        
            phone,
        
            payment_method,
        
            tracking_number:
            `TRK${Date.now()}`,
        
            estimated_delivery:
            '2-3 Days'
        
        }, { transaction: t });

        const orderItemsToInsert = processedItems.map(item => ({
            order_id: order.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
        }));

        await OrderItem.bulkCreate(orderItemsToInsert, { transaction: t });
        await Cart.destroy({

            where: {
                user_id
            },
        
            transaction: t
        });

        await t.commit();

        res.status(201).json({ message: 'Order placed successfully!', order_id: order.order_id, total_amount });

    } catch (error) {
        await t.rollback();
        console.error(error);
        
        const status = error.message.includes('stock') || error.message.includes('not found') ? 400 : 500;
        res.status(status).json({ message: error.message || 'Server error processing order.' });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const user_id = req.user.user_id;

        const orders = await Order.findAll({
            where: { user_id },
            include: [{
                model: OrderItem,
                include: [{ model: Product }]
            }],
            order: [['created_at', 'DESC']]
        });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching orders.' });
    }
};

exports.addToCart = async (req, res) => {

    try {

        const user_id = req.user.user_id;

        const {
            product_id,
            quantity
        } = req.body;

        const product =
        await Product.findByPk(product_id);

        if (!product) {

            return res.status(404).json({
                message: 'Product not found.'
            });
        }

        const existingCart =
        await Cart.findOne({

            where: {
                user_id,
                product_id
            }
        });

        if (existingCart) {

            existingCart.quantity += quantity || 1;

            await existingCart.save();

            return res.json({
                message: 'Cart updated.'
            });
        }

        await Cart.create({

            user_id,

            product_id,

            quantity: quantity || 1,
        });

        res.status(201).json({
            message: 'Added to cart.'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Server error adding to cart.'
        });
    }
};



exports.getCartItems = async (req, res) => {

    try {

        const user_id =
        req.user.user_id;

        const cartItems =
        await Cart.findAll({

            where: { user_id },

            include: [

                {
                    model: Product,

                    include: [
                        {
                            model:
                            ProductCategory
                        }
                    ]
                }
            ],

            order: [
                ['created_at', 'DESC']
            ]
        });

        const formattedCart = cartItems.map(item => ({

            cart_id: item.cart_id,
        
            user_id: item.user_id,
        
            product_id: item.product_id,
        
            quantity: item.quantity,
        
            created_at: item.created_at,
        
            Product: item.Product,
        }));
        
        res.json(formattedCart);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
            'Server error fetching cart.'
        });
    }
};

exports.removeCartItem = async (req, res) => {

    try {

        const cart_id =
        req.params.id;

        const user_id = req.user.user_id;

const cart =
await Cart.findOne({

    where: {
        cart_id,
        user_id
    }
});

        if (!cart) {

            return res.status(404).json({
                message: 'Cart item not found.'
            });
        }

        await cart.destroy();

        res.json({
            message:
            'Item removed from cart.'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
            'Server error removing item.'
        });
    }
};

exports.updateCartQuantity = async (req, res) => {

    try {

        const cart_id =
        req.params.id;

        const { quantity } =
        req.body;

        const cart =
        await Cart.findByPk(cart_id);

        if (!cart) {

            return res.status(404).json({
                message: 'Cart item not found.'
            });
        }

        await cart.update({
            quantity
        });

        res.json({
            message:
            'Quantity updated.'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
            'Server error updating quantity.'
        });
    }
};

exports.getAllOrders = async (req, res) => {

    try {

        const orders =
        await Order.findAll({

            include: [

                {
                    model: OrderItem,

                    include: [
                        {
                            model: Product
                        }
                    ]
                }
            ],

            order: [
                ['created_at', 'DESC']
            ]
        });

        res.json(orders);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
            'Server error fetching all orders.'
        });
    }
};

exports.updateOrderStatus =
async (req, res) => {

    try {

        const order_id =
        req.params.id;

        const { order_status } =
        req.body;

        const order =
        await Order.findByPk(order_id);

        if (!order) {

            return res.status(404).json({

                message:
                'Order not found.'
            });
        }

        await order.update({

            order_status
        });

        res.json({

            message:
            'Order status updated.'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
            'Server error updating order.'
        });
    }
};
