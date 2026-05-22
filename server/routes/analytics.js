const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

router.get('/', (req, res) => {
  try {
    const orders = Order.find();
    const products = Product.find();

    const orderCount = orders.length;
    const productCount = products.length;

    // Calculate Total Revenue
    const totalSales = orders.reduce((sum, order) => sum + (order.totals?.total || 0), 0);

    // Average Order Value
    const aov = orderCount > 0 ? parseFloat((totalSales / orderCount).toFixed(2)) : 0;

    // Sales by Category
    const categorySales = {};
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const category = item.category || 'Other';
          const lineTotal = (item.price || 0) * (item.quantity || 0);
          categorySales[category] = (categorySales[category] || 0) + lineTotal;
        });
      }
    });

    // Recent orders (last 5)
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Construct analytics payload
    res.json({
      summary: {
        totalSales: parseFloat(totalSales.toFixed(2)),
        aov,
        orderCount,
        productCount
      },
      categorySales,
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
