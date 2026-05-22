const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products (with search, filter, and sort)
router.get('/', (req, res) => {
  try {
    let products = Product.find();

    const { search, category, sort } = req.query;

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    if (category && category !== 'All') {
      products = products.filter(p => p.category === category);
    }

    if (sort) {
      if (sort === 'price-low') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-high') {
        products.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        products.sort((a, b) => b.rating - a.rating);
      }
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product
router.get('/:id', (req, res) => {
  try {
    const product = Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product (Admin)
router.post('/', (req, res) => {
  try {
    const { name, description, price, category, image, stock, specs } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }
    const newProduct = Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      image: image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60',
      stock: parseInt(stock) || 0,
      specs: specs || {}
    });
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product (Admin)
router.put('/:id', (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.stock) updates.stock = parseInt(updates.stock);

    const updated = Product.findByIdAndUpdate(req.params.id, updates);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product (Admin)
router.delete('/:id', (req, res) => {
  try {
    const deleted = Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully', deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post review (Customer)
router.post('/:id/review', (req, res) => {
  try {
    const { user, rating, comment } = req.body;
    if (!user || !rating) {
      return res.status(400).json({ error: 'User and rating are required' });
    }

    const product = Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const newReview = {
      user,
      rating: parseFloat(rating),
      comment: comment || '',
      date: new Date().toISOString()
    };

    product.reviews = product.reviews || [];
    product.reviews.push(newReview);

    // Recompute average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = parseFloat((totalRating / product.reviews.length).toFixed(1));

    const updated = Product.findByIdAndUpdate(req.params.id, {
      reviews: product.reviews,
      rating: product.rating
    });

    res.status(201).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
