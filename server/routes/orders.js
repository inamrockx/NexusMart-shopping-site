const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// Get all orders
router.get('/', (req, res) => {
  try {
    const orders = Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get orders by User ID
router.get('/user/:userId', (req, res) => {
  try {
    const orders = Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Order (Checkout)
router.post('/', (req, res) => {
  try {
    const { userId, customerName, email, items, shippingAddress, paymentMethod, totals } = req.body;

    if (!items || items.length === 0 || !totals) {
      return res.status(400).json({ error: 'Cart is empty or pricing details are missing' });
    }

    // Deduct Stock and Validate
    for (let item of items) {
      const dbProduct = Product.findById(item.productId);
      if (!dbProduct) {
        return res.status(404).json({ error: `Product '${item.name}' not found in inventory` });
      }
      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product '${item.name}'. Available: ${dbProduct.stock}` });
      }
    }

    // Deduct stock for real
    for (let item of items) {
      const dbProduct = Product.findById(item.productId);
      Product.findByIdAndUpdate(item.productId, {
        stock: dbProduct.stock - item.quantity
      });
    }

    const newOrder = Order.create({
      userId: userId || 'guest',
      customerName: customerName || 'Guest Customer',
      email: email || 'guest@nexusmart.com',
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'Visa ending in 4242',
      totals
    });

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Order Status (Admin)
router.put('/:id', (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = Order.findByIdAndUpdate(req.params.id, { status });
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
