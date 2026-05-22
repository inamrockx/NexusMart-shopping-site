import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';

const CartDrawer = ({ isOpen, onClose }) => {
  const {
    cart,
    updateCartQty,
    removeFromCart,
    getSubtotal,
    getTax,
    getShipping,
    getTotal,
    formatPrice,
    checkout,
    currentUser,
    t
  } = useContext(StoreContext);

  // States
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Shipping, 2: Payment, 3: Invoice
  
  // Shipping form fields
  const [shippingForm, setShippingForm] = useState({
    name: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States'
  });

  // Prepopulate shipping form if user logged in
  useEffect(() => {
    if (currentUser) {
      setShippingForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        street: currentUser.address?.street || '',
        city: currentUser.address?.city || '',
        state: currentUser.address?.state || '',
        zip: currentUser.address?.zip || '',
        country: currentUser.address?.country || 'United States'
      });
    }
  }, [currentUser, showCheckout]);

  // Credit Card Form Fields
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Created Order Receipt State
  const [receipt, setReceipt] = useState(null);

  // Validation
  const handleNextStep = (e) => {
    e.preventDefault();
    if (checkoutStep === 1) {
      // Validate Shipping fields
      if (!shippingForm.name || !shippingForm.email || !shippingForm.street || !shippingForm.city || !shippingForm.zip) {
        return;
      }
      setCheckoutStep(2);
    }
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Formatting Card Number
    if (name === 'number') {
      const numbers = value.replace(/\D/g, '').slice(0, 16);
      const matches = numbers.match(/\d{4,16}/g);
      const match = (matches && matches[0]) || '';
      const parts = [];

      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }

      if (parts.length > 0) {
        formattedValue = parts.join(' ');
      } else {
        formattedValue = numbers;
      }
    }

    // Formatting Expiry MM/YY
    if (name === 'expiry') {
      const numbers = value.replace(/\D/g, '').slice(0, 4);
      if (numbers.length >= 3) {
        formattedValue = `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`;
      } else {
        formattedValue = numbers;
      }
    }

    // CVV limit 3 digits
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cardDetails.number.replace(/\s/g, '').length < 16 || cardDetails.expiry.length < 5 || cardDetails.cvv.length < 3) {
      return;
    }

    const shippingAddress = `${shippingForm.street}, ${shippingForm.city}, ${shippingForm.state} ${shippingForm.zip}, ${shippingForm.country}`;
    const paymentMethod = `Visa Ending In ${cardDetails.number.slice(-4)}`;

    const orderReceipt = await checkout(shippingAddress, paymentMethod);
    if (orderReceipt) {
      setReceipt(orderReceipt);
      setCheckoutStep(3);
    }
  };

  const handleResetCheckout = () => {
    setShowCheckout(false);
    setCheckoutStep(1);
    setCardDetails({ number: '', name: '', expiry: '', cvv: '' });
    setIsCardFlipped(false);
    setReceipt(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 1. Sliding Cart Drawer */}
      {!showCheckout && (
        <div className="drawer-overlay" onClick={onClose}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3 style={{ fontSize: '20px', fontWeight: '700' }}>{t('cartTitle')} ({cart.length})</h3>
              <button className="icon-btn" onClick={onClose}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="drawer-items">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div key={item.productId} className="drawer-item">
                    <img src={item.image} alt={item.name} className="drawer-item-img" />
                    <div className="drawer-item-details">
                      <h4 className="drawer-item-title">{item.name}</h4>
                      <span className="drawer-item-price">{formatPrice(item.price)}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      {/* Quantity Toggles */}
                      <div className="qty-selector">
                        <button className="qty-btn" onClick={() => updateCartQty(item.productId, item.quantity - 1)}>-</button>
                        <span style={{ fontSize: '13px', fontWeight: '700', minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateCartQty(item.productId, item.quantity + 1)}>+</button>
                      </div>

                      {/* Remove Button */}
                      <span
                        style={{ fontSize: '12px', color: 'var(--danger)', cursor: 'pointer', fontWeight: '500' }}
                        onClick={() => removeFromCart(item.productId)}
                      >
                        Remove
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '16px', color: 'var(--text-secondary)' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <span>{t('emptyCart')}</span>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="drawer-footer">
                <div className="summary-row">
                  <span>{t('subtotal')}</span>
                  <span>{formatPrice(getSubtotal())}</span>
                </div>
                <div className="summary-row">
                  <span>{t('shipping')}</span>
                  <span>{getShipping() === 0 ? 'FREE' : formatPrice(getShipping())}</span>
                </div>
                <div className="summary-row">
                  <span>{t('tax')}</span>
                  <span>{formatPrice(getTax())}</span>
                </div>
                <div className="summary-row total">
                  <span>{t('total')}</span>
                  <span>{formatPrice(getTotal())}</span>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} onClick={() => setShowCheckout(true)}>
                  {t('checkout')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Full Glassmorphism Multi-Step Checkout Overlay Dialog */}
      {showCheckout && (
        <div className="modal-overlay">
          <div className="checkout-modal glass-panel">
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Checkout Wizard</h2>
              {checkoutStep < 3 && (
                <button className="icon-btn" onClick={() => setShowCheckout(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Stepper Wizard Indicator */}
            <div className="wizard-steps">
              <div className={`wizard-step ${checkoutStep >= 1 ? 'completed' : ''} ${checkoutStep === 1 ? 'active' : ''}`}>1</div>
              <div className={`wizard-step ${checkoutStep >= 2 ? 'completed' : ''} ${checkoutStep === 2 ? 'active' : ''}`}>2</div>
              <div className={`wizard-step ${checkoutStep === 3 ? 'completed' : ''}`}>3</div>
            </div>

            {/* STEP 1: Shipping Address Form */}
            {checkoutStep === 1 && (
              <form onSubmit={handleNextStep}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>1. Shipping Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={shippingForm.name}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={shippingForm.email}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={shippingForm.street}
                    onChange={(e) => setShippingForm(prev => ({ ...prev, street: e.target.value }))}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-input"
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-input"
                      value={shippingForm.state}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, state: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Zip Code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={shippingForm.zip}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, zip: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button type="submit" className="btn btn-primary">
                    Continue to Payment
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Credit Card Payment & Flipping Simulator */}
            {checkoutStep === 2 && (
              <form onSubmit={handlePlaceOrder}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>2. Secure Credit Card Payment</h3>
                
                {/* Visual 3D Credit Card Simulator */}
                <div className="card-wrapper">
                  <div className={`credit-card ${isCardFlipped ? 'flipped' : ''}`}>
                    
                    {/* Front Face */}
                    <div className="card-face card-front">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="card-chip" />
                        <span style={{ fontFamily: 'Outfit', fontWeight: '800', fontStyle: 'italic', fontSize: '18px', color: 'white' }}>VISA</span>
                      </div>
                      <div className="card-number">
                        {cardDetails.number || '•••• •••• •••• ••••'}
                      </div>
                      <div className="card-meta">
                        <div>
                          <div style={{ fontSize: '9px', opacity: 0.7 }}>Card Holder</div>
                          <div style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cardDetails.name || 'John Doe'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '9px', opacity: 0.7 }}>Expires</div>
                          <div style={{ fontSize: '12px', fontWeight: '600' }}>{cardDetails.expiry || 'MM/YY'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div className="card-face card-back">
                      <div className="card-stripe" />
                      <div className="card-signature-box">
                        <span style={{ fontSize: '11px', color: '#64748b', marginRight: '8px' }}>CVV</span>
                        <span>{cardDetails.cvv || '•••'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Electronic Use Only
                      </div>
                    </div>

                  </div>
                </div>

                {/* Card Fields inputs */}
                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={cardDetails.name}
                    onChange={handleCardInputChange}
                    onFocus={() => setIsCardFlipped(false)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    name="number"
                    className="form-input"
                    placeholder="e.g. 4111 2222 3333 4444"
                    value={cardDetails.number}
                    onChange={handleCardInputChange}
                    onFocus={() => setIsCardFlipped(false)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Expiration Date</label>
                    <input
                      type="text"
                      name="expiry"
                      className="form-input"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={handleCardInputChange}
                      onFocus={() => setIsCardFlipped(false)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Security Code (CVV)</label>
                    <input
                      type="text"
                      name="cvv"
                      className="form-input"
                      placeholder="CVV"
                      value={cardDetails.cvv}
                      onChange={handleCardInputChange}
                      onFocus={() => setIsCardFlipped(true)}
                      onBlur={() => setIsCardFlipped(false)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setCheckoutStep(1)}>
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Pay {formatPrice(getTotal())}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Invoice Receipt Printable Simulation */}
            {checkoutStep === 3 && receipt && (
              <div style={{ animation: 'fadeIn 0.6s ease-in-out' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Order Placed Successfully!</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Your receipt/invoice is generated below.</p>
                </div>

                {/* Monospace invoice sheet */}
                <div className="invoice-receipt">
                  <div className="invoice-header">
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>NEXUSMART INVOICE</h2>
                    <span>Order: {receipt.orderNumber}</span><br />
                    <span>Date: {new Date(receipt.createdAt).toLocaleString()}</span>
                  </div>

                  <div>
                    <strong>Customer:</strong> {receipt.customerName}<br />
                    <strong>Email:</strong> {receipt.email}<br />
                    <strong>Deliver To:</strong> {receipt.shippingAddress}
                  </div>

                  <div className="invoice-divider" />

                  <div>
                    {receipt.items && receipt.items.map((item, index) => (
                      <div key={index} className="invoice-item-row">
                        <span>{item.name} (x{item.quantity})</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="invoice-divider" />

                  <div className="invoice-item-row">
                    <span>Subtotal:</span>
                    <span>{formatPrice(receipt.totals.subtotal)}</span>
                  </div>
                  <div className="invoice-item-row">
                    <span>Shipping:</span>
                    <span>{receipt.totals.shipping === 0 ? 'FREE' : formatPrice(receipt.totals.shipping)}</span>
                  </div>
                  <div className="invoice-item-row">
                    <span>Tax (8%):</span>
                    <span>{formatPrice(receipt.totals.tax)}</span>
                  </div>
                  
                  <div className="invoice-divider" />

                  <div className="invoice-item-row" style={{ fontWeight: 'bold', color: 'white', fontSize: '15px' }}>
                    <span>TOTAL PAID:</span>
                    <span>{formatPrice(receipt.totals.total)}</span>
                  </div>

                  <div className="invoice-divider" />
                  <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                    Thank you for choosing NexusMart.<br />
                    This document serves as your official payment receipt.
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button className="btn btn-primary" onClick={handleResetCheckout}>
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default CartDrawer;
