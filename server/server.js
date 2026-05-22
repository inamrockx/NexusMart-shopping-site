const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// Simple Health Check
app.get('/', (req, res) => {
  res.send('NexusMart API Server is running smoothly.');
});

// Start Server
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`NexusMart API Server running on port ${PORT}`);
  console.log(`Local Endpoint: http://localhost:${PORT}`);
  console.log(`=============================================`);
});
