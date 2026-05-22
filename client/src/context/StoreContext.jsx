import React, { createContext, useState, useEffect } from 'react';

export const StoreContext = createContext();

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [theme, setTheme] = useState('dark');
  const [toasts, setToasts] = useState([]);

  // Selections & Exchanges
  const exchangeRates = { USD: 1.0, EUR: 0.92, GBP: 0.79 };
  const currencySymbols = { USD: '$', EUR: '€', GBP: '£' };

  // Localization Dictionary
  const translations = {
    en: {
      searchPlaceholder: "Search premium products...",
      allCategories: "All Categories",
      addToCart: "Add To Cart",
      outOfStock: "Out of Stock",
      cartTitle: "Shopping Cart",
      checkout: "Proceed to Checkout",
      wishlist: "Wishlist",
      orders: "My Orders",
      admin: "Admin Console",
      login: "Sign In",
      logout: "Sign Out",
      currency: "Currency",
      language: "Language",
      theme: "Theme",
      emptyCart: "Your cart is currently empty.",
      total: "Total",
      subtotal: "Subtotal",
      shipping: "Shipping",
      tax: "Estimated Tax",
      reviews: "Customer Reviews",
      specs: "Specifications",
      addReview: "Write a Review",
      orderHistory: "Order History",
      analytics: "Sales Analytics"
    },
    es: {
      searchPlaceholder: "Buscar productos premium...",
      allCategories: "Todas las categorías",
      addToCart: "Añadir al carrito",
      outOfStock: "Agotado",
      cartTitle: "Carrito de compras",
      checkout: "Proceder al pago",
      wishlist: "Lista de deseos",
      orders: "Mis pedidos",
      admin: "Consola de administrador",
      login: "Iniciar sesión",
      logout: "Cerrar sesión",
      currency: "Moneda",
      language: "Idioma",
      theme: "Tema",
      emptyCart: "Su carrito está vacío.",
      total: "Total",
      subtotal: "Subtotal",
      shipping: "Envío",
      tax: "Impuesto Estimado",
      reviews: "Opiniones de los clientes",
      specs: "Especificaciones",
      addReview: "Escribir una reseña",
      orderHistory: "Historial de pedidos",
      analytics: "Análisis de ventas"
    },
    fr: {
      searchPlaceholder: "Rechercher des produits premium...",
      allCategories: "Toutes catégories",
      addToCart: "Ajouter au panier",
      outOfStock: "Rupture de stock",
      cartTitle: "Panier d'achat",
      checkout: "Passer à la caisse",
      wishlist: "Liste de souhaits",
      orders: "Mes commandes",
      admin: "Console d'administration",
      login: "Se connecter",
      logout: "Se déconnecter",
      currency: "Devise",
      language: "Langue",
      theme: "Thème",
      emptyCart: "Votre panier est vide.",
      total: "Total",
      subtotal: "Sous-total",
      shipping: "Livraison",
      tax: "Taxe Estimée",
      reviews: "Avis des clients",
      specs: "Caractéristiques",
      addReview: "Rédiger un avis",
      orderHistory: "Historique des commandes",
      analytics: "Analyses des ventes"
    }
  };

  // Trigger Toast Notification
  const triggerToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Fetch Catalog
  const fetchProducts = async (filters = {}) => {
    try {
      const { search, category, sort } = filters;
      let url = `${API_BASE}/products`;
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (category) params.push(`category=${encodeURIComponent(category)}`);
      if (sort) params.push(`sort=${encodeURIComponent(sort)}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  // Helper to merge guest cart with authenticated user cart
  const mergeCarts = (guestCart, userCart) => {
    const merged = [...userCart];
    guestCart.forEach((guestItem) => {
      const existingIndex = merged.findIndex((item) => item.productId === guestItem.productId);
      if (existingIndex !== -1) {
        merged[existingIndex].quantity += guestItem.quantity;
      } else {
        merged.push({ ...guestItem });
      }
    });
    return merged;
  };

  // Load Initial Store Data
  useEffect(() => {
    fetchProducts();
    // Restore User & Cart
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      const parsedUser = JSON.parse(cachedUser);
      setCurrentUser(parsedUser);
      setCart(parsedUser.cart || []);
    }
    // Restore Theme
    const cachedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(cachedTheme);
    document.documentElement.setAttribute('data-theme', cachedTheme);
  }, []);

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      let url = `${API_BASE}/orders`;
      if (currentUser && currentUser.role !== 'admin') {
        url = `${API_BASE}/orders/user/${currentUser._id}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [currentUser]);

  // Sync cart changes to backend for logged-in users
  useEffect(() => {
    if (!currentUser) return;

    const syncCart = async () => {
      try {
        await fetch(`${API_BASE}/users/${currentUser._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart })
        });
        
        // Also keep local storage cached user in sync
        const cached = localStorage.getItem('user');
        if (cached) {
          const userObj = JSON.parse(cached);
          userObj.cart = cart;
          localStorage.setItem('user', JSON.stringify(userObj));
        }
      } catch (err) {
        console.error('Failed to sync cart to backend:', err);
      }
    };

    syncCart();
  }, [cart, currentUser?._id]);

  // Auth Operations
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      // Merge current guest cart with the user's saved cart from db
      const guestCart = cart;
      const dbCart = data.cart || [];
      const mergedCart = mergeCarts(guestCart, dbCart);

      // Persist the merged cart back to the database immediately
      if (mergedCart.length > 0) {
        const updateRes = await fetch(`${API_BASE}/users/${data._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart: mergedCart })
        });
        if (updateRes.ok) {
          data.cart = mergedCart;
        }
      }

      setCurrentUser(data);
      setCart(mergedCart);
      localStorage.setItem('user', JSON.stringify(data));
      triggerToast(`Welcome back, ${data.name}!`, 'success');
      return true;
    } catch (err) {
      triggerToast(err.message, 'danger');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // For a new user, they have no saved cart in the db. 
      // So their cart is exactly the current guest cart.
      const guestCart = cart;
      if (guestCart.length > 0) {
        const updateRes = await fetch(`${API_BASE}/users/${data._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart: guestCart })
        });
        if (updateRes.ok) {
          data.cart = guestCart;
        }
      }

      setCurrentUser(data);
      setCart(guestCart);
      localStorage.setItem('user', JSON.stringify(data));
      triggerToast(`Account created! Welcome, ${data.name}!`, 'success');
      return true;
    } catch (err) {
      triggerToast(err.message, 'danger');
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
    localStorage.removeItem('user');
    triggerToast('Logged out successfully', 'info');
  };

  // Cart Operations
  const addToCart = (product, quantity = 1) => {
    if (product.stock <= 0) {
      triggerToast('Product is currently out of stock!', 'warning');
      return;
    }
    
    setCart((prev) => {
      const index = prev.findIndex((item) => item.productId === product._id);
      const currentQty = index !== -1 ? prev[index].quantity : 0;
      const totalQty = currentQty + quantity;

      if (product.stock < totalQty) {
        triggerToast(`Only ${product.stock} items available in stock!`, 'warning');
        return prev;
      }

      triggerToast(`Added ${product.name} to cart!`);
      if (index !== -1) {
        const updated = [...prev];
        updated[index].quantity = totalQty;
        return updated;
      }
      return [...prev, {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity
      }];
    });
  };

  const updateCartQty = (productId, qty) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;

    if (qty > product.stock) {
      triggerToast(`Only ${product.stock} items available in stock!`, 'warning');
      return;
    }

    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: qty } : item))
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
    triggerToast('Item removed from cart', 'info');
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const isFav = prev.includes(productId);
      if (isFav) {
        triggerToast('Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        triggerToast('Added to wishlist!', 'success');
        return [...prev, productId];
      }
    });
  };

  // Calculations
  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getTax = () => {
    return getSubtotal() * 0.08; // 8% Est Tax
  };

  const getShipping = () => {
    const sub = getSubtotal();
    return sub > 150 || sub === 0 ? 0 : 15.0; // Free shipping above $150
  };

  const getTotal = () => {
    return getSubtotal() + getTax() + getShipping();
  };

  // Currency Converter Utility
  const formatPrice = (val) => {
    const converted = val * exchangeRates[currency];
    return `${currencySymbols[currency]}${converted.toFixed(2)}`;
  };

  // Language Translator Utility
  const t = (key) => {
    return translations[language][key] || key;
  };

  // Submit Checkout Transaction
  const checkout = async (shippingAddress, paymentMethod) => {
    try {
      const body = {
        userId: currentUser ? currentUser._id : 'guest',
        customerName: currentUser ? currentUser.name : 'Guest Customer',
        email: currentUser ? currentUser.email : 'guest@nexusmart.com',
        items: cart,
        shippingAddress,
        paymentMethod,
        totals: {
          subtotal: parseFloat(getSubtotal().toFixed(2)),
          tax: parseFloat(getTax().toFixed(2)),
          shipping: parseFloat(getShipping().toFixed(2)),
          total: parseFloat(getTotal().toFixed(2))
        }
      };

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      setCart([]);
      fetchProducts(); // Refresh catalog stock counts
      fetchOrders();   // Refresh orders list
      triggerToast('Order placed successfully! Invoiced generated.', 'success');
      return data;
    } catch (err) {
      triggerToast(err.message, 'danger');
      return null;
    }
  };

  // Admin Ops
  const addNewProduct = async (productData) => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add product');

      fetchProducts();
      triggerToast('New product added to catalog!', 'success');
      return true;
    } catch (err) {
      triggerToast(err.message, 'danger');
      return false;
    }
  };

  const editProduct = async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update product');

      fetchProducts();
      triggerToast('Product details updated successfully!', 'success');
      return true;
    } catch (err) {
      triggerToast(err.message, 'danger');
      return false;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');

      fetchProducts();
      triggerToast('Product deleted from inventory', 'warning');
      return true;
    } catch (err) {
      triggerToast(err.message, 'danger');
      return false;
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order');

      fetchOrders();
      triggerToast(`Order status updated to: ${status}`, 'success');
      return true;
    } catch (err) {
      triggerToast(err.message, 'danger');
      return false;
    }
  };

  const submitReview = async (productId, reviewData) => {
    try {
      const res = await fetch(`${API_BASE}/products/${productId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');

      fetchProducts();
      triggerToast('Thank you! Review posted.', 'success');
      return true;
    } catch (err) {
      triggerToast(err.message, 'danger');
      return false;
    }
  };

  // Toggle Theme
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    triggerToast(`Theme switched to: ${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`, 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        wishlist,
        currentUser,
        orders,
        language,
        setLanguage,
        currency,
        setCurrency,
        theme,
        changeTheme,
        toasts,
        triggerToast,
        addToCart,
        updateCartQty,
        removeFromCart,
        toggleWishlist,
        getSubtotal,
        getTax,
        getShipping,
        getTotal,
        formatPrice,
        t,
        login,
        register,
        logout,
        checkout,
        addNewProduct,
        editProduct,
        deleteProduct,
        updateOrderStatus,
        submitReview,
        fetchProducts,
        fetchOrders
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
