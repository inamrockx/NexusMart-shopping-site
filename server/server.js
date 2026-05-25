const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve React static assets
app.use(express.static(path.join(__dirname, '../client/dist')));

// Routes
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// Fallback all non-API GET requests to the React frontend SPA
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`NexusMart API Server running on port ${PORT}`);
  console.log(`Local Endpoint: http://localhost:${PORT}`);
  console.log(`=============================================`);
});
