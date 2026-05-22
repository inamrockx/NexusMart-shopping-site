import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';

const AdminPanel = () => {
  const {
    products,
    addNewProduct,
    editProduct,
    deleteProduct,
    updateOrderStatus,
    formatPrice,
    triggerToast
  } = useContext(StoreContext);

  // States
  const [adminTab, setAdminTab] = useState('analytics'); // analytics, inventory, orders
  const [analyticsData, setAnalyticsData] = useState({
    summary: { totalSales: 0, aov: 0, orderCount: 0, productCount: 0 },
    categorySales: {},
    recentOrders: []
  });
  const [adminOrders, setAdminOrders] = useState([]);

  // Product Form Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Tech & Gadgets',
    image: '',
    stock: '',
    specs: ''
  });

  // Fetch Analytics & Orders
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const fetchAdminOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      if (res.ok) {
        const data = await res.json();
        setAdminOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchAdminOrders();
  }, [products]);

  // Product submission
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.stock) return;

    // Parse specs MM:val, YY:val format
    const parsedSpecs = {};
    if (productForm.specs) {
      productForm.specs.split(',').forEach(part => {
        const [k, v] = part.split(':');
        if (k && v) parsedSpecs[k.trim()] = v.trim();
      });
    }

    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      category: productForm.category,
      image: productForm.image || undefined,
      stock: parseInt(productForm.stock),
      specs: parsedSpecs
    };

    let success = false;
    if (isEditing) {
      success = await editProduct(editingId, payload);
    } else {
      success = await addNewProduct(payload);
    }

    if (success) {
      setShowProductModal(false);
      resetProductForm();
      fetchAnalytics();
    }
  };

  const handleEditClick = (p) => {
    setIsEditing(true);
    setEditingId(p._id);
    
    // Format specs back to CSV
    const specCSV = Object.entries(p.specs || {})
      .map(([k, v]) => `${k}:${v}`)
      .join(', ');

    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      stock: p.stock,
      specs: specCSV
    });
    setShowProductModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const success = await deleteProduct(id);
      if (success) fetchAnalytics();
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      fetchAdminOrders();
      fetchAnalytics();
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: 'Tech & Gadgets',
      image: '',
      stock: '',
      specs: ''
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Compile max category sale for chart scaling
  const categorySalesEntries = Object.entries(analyticsData.categorySales || {});
  const maxSaleValue = categorySalesEntries.length > 0 
    ? Math.max(...categorySalesEntries.map(([_, val]) => val)) 
    : 1;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Admin header console tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase' }}>Shopify Operations Center</span>
          <h2 style={{ fontSize: '32px', fontWeight: '800' }}>Back-Office Control</h2>
        </div>
        
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
          <button className={`btn ${adminTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: '13px', border: 'none' }} onClick={() => setAdminTab('analytics')}>
            KPI Analytics
          </button>
          <button className={`btn ${adminTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: '13px', border: 'none' }} onClick={() => setAdminTab('inventory')}>
            Inventory Grid
          </button>
          <button className={`btn ${adminTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: '13px', border: 'none' }} onClick={() => setAdminTab('orders')}>
            Orders Manager
          </button>
        </div>
      </div>

      {/* 1. KEY PERFORMANCE INDICATORS PANEL */}
      {adminTab === 'analytics' && (
        <div>
          {/* Dashboard Metric cards */}
          <div className="admin-grid">
            <div className="admin-kpi-card glass-panel" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Gross Store Sales</span>
              <div className="admin-kpi-val">{formatPrice(analyticsData.summary.totalSales)}</div>
            </div>
            <div className="admin-kpi-card glass-panel" style={{ borderLeft: '4px solid var(--accent-secondary)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Average Order Value</span>
              <div className="admin-kpi-val">{formatPrice(analyticsData.summary.aov)}</div>
            </div>
            <div className="admin-kpi-card glass-panel" style={{ borderLeft: '4px solid var(--success)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Fulfillment Orders</span>
              <div className="admin-kpi-val">{analyticsData.summary.orderCount}</div>
            </div>
            <div className="admin-kpi-card glass-panel" style={{ borderLeft: '4px solid var(--warning)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Active Items Catalog</span>
              <div className="admin-kpi-val">{analyticsData.summary.productCount}</div>
            </div>
          </div>

          {/* Interactive graphical statistics chart bar */}
          <div className="chart-container glass-panel">
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Category Sales Distribution ($ USD)</h3>
            <div className="chart-bars-flow">
              {categorySalesEntries.length > 0 ? (
                categorySalesEntries.map(([cat, val]) => {
                  const heightPercent = Math.min(100, Math.max(10, (val / maxSaleValue) * 100));
                  return (
                    <div key={cat} className="chart-bar-wrapper">
                      <span style={{ fontSize: '12px', fontWeight: '700' }}>{formatPrice(val)}</span>
                      <div className="chart-bar-pillar" style={{ height: `${heightPercent}%`, minHeight: '16px' }} title={`${cat}: ${formatPrice(val)}`} />
                      <span className="chart-bar-lbl">{cat}</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  <span>Waiting for purchase data to populate charts...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. INVENTORY CATALOG MANAGER PANEL */}
      {adminTab === 'inventory' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px' }}>Active Inventory Catalog</h3>
            <button className="btn btn-primary" onClick={() => { resetProductForm(); setShowProductModal(true); }}>
              + Add New Product
            </button>
          </div>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Available Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      <span style={{ fontWeight: '600' }}>{p.name}</span>
                    </td>
                    <td>{p.category}</td>
                    <td style={{ fontWeight: '700' }}>{formatPrice(p.price)}</td>
                    <td style={{ color: p.stock > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '600' }}>
                      {p.stock} units
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEditClick(p)}>
                          Edit
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleDeleteClick(p._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CUSTOMER ORDERS MANAGER PANEL */}
      {adminTab === 'orders' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>Customer Purchase Transactions</h3>

          {adminOrders.length > 0 ? (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Customer Name</th>
                    <th>Subtotal</th>
                    <th>Total Charged</th>
                    <th>Current Status</th>
                    <th>Process Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminOrders.map(o => (
                    <tr key={o._id}>
                      <td style={{ fontWeight: '600' }}>{o.orderNumber}</td>
                      <td>
                        <strong>{o.customerName}</strong><br />
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{o.email}</span>
                      </td>
                      <td>{formatPrice(o.totals?.subtotal)}</td>
                      <td style={{ fontWeight: '700' }}>{formatPrice(o.totals?.total)}</td>
                      <td>
                        <span className={`status-badge ${o.status.toLowerCase()}`}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                          style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-glass)',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <span>No orders registered on the platform yet.</span>
            </div>
          )}
        </div>
      )}

      {/* Product Form Modal (Add/Edit) */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="checkout-modal glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>
                {isEditing ? 'Modify Catalog Product' : 'Add New Catalog Product'}
              </h3>
              <button className="icon-btn" onClick={() => setShowProductModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label className="form-label">Product Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. AeroSound Headphones"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Description</label>
                <textarea
                  className="form-input"
                  placeholder="Summarize product specifications and marketing copies..."
                  rows="3"
                  style={{ resize: 'none' }}
                  value={productForm.description}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="e.g. 199.99"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Inventory Stock</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 50"
                    value={productForm.stock}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={productForm.category}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    style={{ background: 'var(--bg-primary)', cursor: 'pointer' }}
                  >
                    <option value="Tech & Gadgets">Tech & Gadgets</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Smart Home">Smart Home</option>
                    <option value="Active Lifestyle">Active Lifestyle</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Image URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://unsplash.com/... or leave blank for default placeholder"
                  value={productForm.image}
                  onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Technical Specs (format as: "Battery:45hr, Bluetooth:v5.3")</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Key1:Val1, Key2:Val2..."
                  value={productForm.specs}
                  onChange={(e) => setProductForm(prev => ({ ...prev, specs: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
