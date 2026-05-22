import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';

const UserDashboard = () => {
  const {
    currentUser,
    orders,
    wishlist,
    products,
    formatPrice,
    addToCart,
    toggleWishlist,
    triggerToast
  } = useContext(StoreContext);

  // States
  const [activeTab, setActiveTab] = useState('orders'); // orders, wishlist, profile
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Profile Update Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States'
  });

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        street: currentUser.address?.street || '',
        city: currentUser.address?.city || '',
        state: currentUser.address?.state || '',
        zip: currentUser.address?.zip || '',
        country: currentUser.address?.country || 'United States'
      });
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/users/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name,
          address: {
            street: profileForm.street,
            city: profileForm.city,
            state: profileForm.state,
            zip: profileForm.zip,
            country: profileForm.country
          }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      
      // Update local storage user details
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...data }));
      triggerToast('Account profile updated successfully!', 'success');
      // Reload page state or let Context handle it (we assume a simple refresh or local update)
    } catch (err) {
      triggerToast(err.message, 'danger');
    }
  };

  // Get Wishlisted Product Objects
  const wishlistedProducts = products.filter(p => wishlist.includes(p._id));

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'var(--accent-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Customer Hub</span>
          <h2 style={{ fontSize: '32px', fontWeight: '800' }}>Hello, {currentUser?.name || 'Valued Shopper'}</h2>
        </div>
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
          <button className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: '13px', border: 'none' }} onClick={() => setActiveTab('orders')}>
            Orders
          </button>
          <button className={`btn ${activeTab === 'wishlist' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: '13px', border: 'none' }} onClick={() => setActiveTab('wishlist')}>
            Wishlist
          </button>
          <button className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: '13px', border: 'none' }} onClick={() => setActiveTab('profile')}>
            Profile
          </button>
        </div>
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Purchase Order History</h3>
          
          {orders.length > 0 ? (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Payment Method</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td style={{ fontWeight: '600' }}>{o.orderNumber}</td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td>{o.paymentMethod}</td>
                      <td style={{ fontWeight: '700' }}>{formatPrice(o.totals?.total)}</td>
                      <td>
                        <span className={`status-badge ${o.status.toLowerCase()}`}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setSelectedOrder(o)}>
                          View Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <h4>No orders recorded yet.</h4>
              <p>Explore our premium collections and place your first order!</p>
            </div>
          )}
        </div>
      )}

      {/* WISHLIST TAB */}
      {activeTab === 'wishlist' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Your Curated Wishlist</h3>

          {wishlistedProducts.length > 0 ? (
            <div className="product-grid">
              {wishlistedProducts.map(p => (
                <div key={p._id} className="product-card">
                  <img src={p.image} alt={p.name} className="product-card-image" />
                  <div className="wishlist-heart active" onClick={() => toggleWishlist(p._id)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <div className="product-card-body">
                    <span className="product-card-cat">{p.category}</span>
                    <h4 className="product-card-title">{p.name}</h4>
                    <div className="product-card-footer">
                      <span className="product-card-price">{formatPrice(p.price)}</span>
                      <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '12px' }} onClick={() => addToCart(p)}>
                        Add To Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <h4>Your wishlist is empty.</h4>
              <p>Add products you like by clicking the hearts on catalog cards!</p>
            </div>
          )}
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '700px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Delivery Address & Personal Settings</h3>
          
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                className="form-input"
                value={profileForm.street}
                onChange={(e) => setProfileForm(prev => ({ ...prev, street: e.target.value }))}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileForm.state}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, state: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Zip Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileForm.zip}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, zip: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                className="form-input"
                value={profileForm.country}
                onChange={(e) => setProfileForm(prev => ({ ...prev, country: e.target.value }))}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary">
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invoice Modal Overlay */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="checkout-modal glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Order Details</h3>
              <button className="icon-btn" onClick={() => setSelectedOrder(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="invoice-receipt" style={{ background: 'var(--bg-primary)', margin: 0 }}>
              <div className="invoice-header">
                <h4 style={{ fontWeight: '700', color: 'white' }}>NEXUSMART INVOICE</h4>
                <span>Order Ref: {selectedOrder.orderNumber}</span><br />
                <span>Status: {selectedOrder.status}</span>
              </div>

              <div>
                <strong>Client:</strong> {selectedOrder.customerName}<br />
                <strong>Address:</strong> {selectedOrder.shippingAddress}
              </div>

              <div className="invoice-divider" />

              <div>
                {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="invoice-item-row">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="invoice-divider" />

              <div className="invoice-item-row">
                <span>Subtotal:</span>
                <span>{formatPrice(selectedOrder.totals?.subtotal)}</span>
              </div>
              <div className="invoice-item-row">
                <span>Shipping:</span>
                <span>{selectedOrder.totals?.shipping === 0 ? 'FREE' : formatPrice(selectedOrder.totals?.shipping)}</span>
              </div>
              <div className="invoice-item-row">
                <span>Tax (8%):</span>
                <span>{formatPrice(selectedOrder.totals?.tax)}</span>
              </div>

              <div className="invoice-divider" />

              <div className="invoice-item-row" style={{ fontWeight: 'bold', color: 'white', fontSize: '15px' }}>
                <span>TOTAL:</span>
                <span>{formatPrice(selectedOrder.totals?.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
