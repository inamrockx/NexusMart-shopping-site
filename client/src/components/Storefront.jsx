import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';

const Storefront = () => {
  const { products, addToCart, toggleWishlist, wishlist, formatPrice, t, fetchProducts, submitReview } = useContext(StoreContext);

  // States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('rating');
  const [priceRange, setPriceRange] = useState(2000);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  
  // Review Form States
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Flash Sale Timer Simulator
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 19, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts({ search, category, sort });
  }, [search, category, sort]);

  // Handle price filtering locally for responsiveness
  const filteredProducts = products.filter(p => p.price <= priceRange);

  // Search Autocomplete Suggestion Logic
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim().length > 1) {
      const match = products.filter(p => p.name.toLowerCase().includes(value.toLowerCase())).slice(0, 5);
      setSuggestions(match);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (name) => {
    setSearch(name);
    setSuggestions([]);
  };

  // Submit dynamic reviews to backend MERN api
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const success = await submitReview(selectedProduct._id, {
      user: reviewName,
      rating: reviewRating,
      comment: reviewComment
    });

    if (success) {
      // Re-fetch details to show new review
      const res = await fetch(`http://localhost:5000/api/products/${selectedProduct._id}`);
      if (res.ok) {
        const freshProduct = await res.json();
        setSelectedProduct(freshProduct);
      }
      setReviewName('');
      setReviewComment('');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      
      {/* 1. Hero Promotional Area & Flash Sales */}
      <section className="hero-section">
        <div className="hero-banner">
          <span className="hero-subtitle">Elevated Living Aesthetics</span>
          <h1 className="hero-title">Discover NexusMart Elite Editions</h1>
          <p className="hero-description">Experience the future of lifestyle engineering. Hand-curated items designed for high-performance and sensory absolute perfection.</p>
          <div>
            <button className="btn btn-primary" onClick={() => { setCategory('All'); setSearch(''); }}>
              Explore Collection
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* Flash Sale Banner */}
        <div className="flash-sale-card">
          <span className="flash-sale-badge">FLASH SALE</span>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>ChronoLux Quartz Special Edition</h3>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Limited availability. Offers expire in:</span>
            
            {/* Clock Timer */}
            <div className="flash-sale-timer">
              <div className="timer-box">
                <div className="timer-val">{timeLeft.hours.toString().padStart(2, '0')}</div>
                <div className="timer-lbl">Hours</div>
              </div>
              <div className="timer-box">
                <div className="timer-val">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                <div className="timer-lbl">Mins</div>
              </div>
              <div className="timer-box">
                <div className="timer-val">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                <div className="timer-lbl">Secs</div>
              </div>
            </div>
          </div>

          <div className="stock-progress-container">
            <div className="stock-progress-labels">
              <span>Hurry! Stock Sold: 72%</span>
              <span style={{ fontWeight: '700' }}>12/30 Left</span>
            </div>
            <div className="stock-progress-bar">
              <div className="stock-progress-fill" style={{ width: '72%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Faceted Search and Filters Dashboard */}
      <div className="catalog-container">
        
        {/* Filters Sidebar */}
        <aside className="filters-sidebar glass-panel">
          <div className="filter-title">
            <h4 style={{ fontWeight: '700' }}>Filters</h4>
            <span style={{ fontSize: '12px', color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => { setCategory('All'); setPriceRange(2000); setSearch(''); }}>Reset</span>
          </div>

          {/* Categories Filter */}
          <div className="filter-section">
            <span className="filter-lbl">Categories</span>
            <div className="category-list">
              {['All', 'Tech & Gadgets', 'Fashion & Apparel', 'Smart Home', 'Active Lifestyle'].map(cat => (
                <div key={cat} className={`category-item ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
                  <span className="category-bullet" />
                  <span>{cat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-section">
            <span className="filter-lbl">Max Price: {formatPrice(priceRange)}</span>
            <div className="price-range-slider">
              <input
                type="range"
                min="20"
                max="2000"
                step="20"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>$20</span>
                <span>$2000</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Catalog Main Panel */}
        <main className="catalog-panel">
          
          <div className="catalog-header">
            {/* Search Box */}
            <div className="search-box">
              <svg className="search-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                className="search-input"
                value={search}
                onChange={handleSearchChange}
              />
              {suggestions.length > 0 && (
                <div className="search-suggestions">
                  {suggestions.map(p => (
                    <div key={p._id} className="suggestion-item" onClick={() => handleSuggestionClick(p.name)}>
                      <img src={p.image} alt={p.name} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>{p.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sorting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sort By:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-glass)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="product-grid">
            {filteredProducts.map(p => (
              <div key={p._id} className="product-card" onClick={() => setSelectedProduct(p)} style={{ cursor: 'pointer' }}>
                <img src={p.image} alt={p.name} className="product-card-image" />
                
                {/* Wishlist Toggle Button */}
                <div
                  className={`wishlist-heart ${wishlist.includes(p._id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(p._id);
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlist.includes(p._id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>

                <div className="product-card-body">
                  <span className="product-card-cat">{p.category}</span>
                  <h4 className="product-card-title">{p.name}</h4>
                  <p className="product-card-desc">{p.description}</p>
                  
                  <div className="product-card-footer">
                    <span className="product-card-price">{formatPrice(p.price)}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="rating-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--warning)" stroke="var(--warning)">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {p.rating.toFixed(1)}
                      </span>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p);
                        }}
                      >
                        {t('addToCart')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              <h3>No products found matching your active criteria.</h3>
              <p>Try reducing filters or extending search keywords.</p>
            </div>
          )}
        </main>
      </div>

      {/* 3. Detailed Product Modal View Overlay */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-left">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="modal-image" />
              <button className="icon-btn modal-close" onClick={() => setSelectedProduct(null)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-right">
              <div>
                <span className="product-card-cat">{selectedProduct.category}</span>
                <h2 style={{ fontSize: '28px', margin: '4px 0 8px', color: 'var(--text-primary)' }}>{selectedProduct.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span className="rating-badge" style={{ fontSize: '13px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--warning)" stroke="var(--warning)">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {selectedProduct.rating.toFixed(1)}
                  </span>
                  <span>({selectedProduct.reviews?.length || 0} customer reviews)</span>
                  <span style={{ color: selectedProduct.stock > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '600' }}>
                    {selectedProduct.stock > 0 ? `In Stock (${selectedProduct.stock})` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                {formatPrice(selectedProduct.price)}
              </div>

              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{selectedProduct.description}</p>
              </div>

              {/* Technical Specifications */}
              {selectedProduct.specs && Object.keys(selectedProduct.specs).length > 0 && (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>{t('specs')}</h4>
                  <div className="specs-grid">
                    {Object.entries(selectedProduct.specs).map(([key, val]) => (
                      <div key={key} className="specs-item">
                        <span className="specs-lbl">{key}</span>
                        <span className="specs-val">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buy Options */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                <button
                  className="btn btn-primary"
                  style={{ flexGrow: 1 }}
                  disabled={selectedProduct.stock <= 0}
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                >
                  {selectedProduct.stock > 0 ? t('addToCart') : t('outOfStock')}
                </button>
                <button className="icon-btn" onClick={() => toggleWishlist(selectedProduct._id)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlist.includes(selectedProduct._id) ? 'var(--danger)' : 'none'} stroke={wishlist.includes(selectedProduct._id) ? 'var(--danger)' : 'currentColor'} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              {/* Dynamic Customer Reviews */}
              <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '20px', marginTop: '10px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>{t('reviews')}</h4>
                
                {/* List Reviews */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                    selectedProduct.reviews.map((r, idx) => (
                      <div key={idx} style={{ background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: '600', fontSize: '13px' }}>{r.user}</span>
                          <span className="rating-badge" style={{ fontSize: '11px', padding: '2px 6px' }}>★ {r.rating}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{r.comment}</p>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--text-muted)' }}>No reviews yet for this product. Be the first to write!</span>
                  )}
                </div>

                {/* Review Form */}
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h5 style={{ fontSize: '13px', fontWeight: '600' }}>{t('addReview')}</h5>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="form-input"
                      style={{ padding: '8px 12px', fontSize: '13px' }}
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      required
                    />
                    
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(parseInt(e.target.value))}
                      style={{
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-glass)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="5">★★★★★ (5 Stars)</option>
                      <option value="4">★★★★☆ (4 Stars)</option>
                      <option value="3">★★★☆☆ (3 Stars)</option>
                      <option value="2">★★☆☆☆ (2 Stars)</option>
                      <option value="1">★☆☆☆☆ (1 Star)</option>
                    </select>
                  </div>

                  <textarea
                    placeholder="Share your thoughts about this product..."
                    className="form-input"
                    rows="3"
                    style={{ padding: '8px 12px', fontSize: '13px', resize: 'none' }}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                  />

                  <div>
                    <button type="submit" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                      Submit Review
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Storefront;
