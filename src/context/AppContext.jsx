import React, { createContext, useContext, useEffect, useState } from 'react';
import { PRODUCTS_INITIAL, ORDERS_INITIAL, USERS_INITIAL } from '../data/mockData';
import { api, hasApi } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState(PRODUCTS_INITIAL);
  const [orders, setOrders] = useState(ORDERS_INITIAL);
  const [users, setUsers] = useState(USERS_INITIAL);
  const [cart, setCart] = useState([]);
  const [apiError, setApiError] = useState('');
  const [orderDraft, setOrderDraft] = useState({
    packagingType: 'fundas',
    packagingId: '',
    customer: {
      name: '',
      phone: '',
      address: '',
      reference: '',
    },
    notes: '',
  });

  useEffect(() => {
    if (!hasApi) return;

    let active = true;

    Promise.all([
      api.getProducts().catch(() => null),
      api.getOrders().catch(() => null),
      api.getUsers().catch(() => null),
    ]).then(([apiProducts, apiOrders, apiUsers]) => {
      if (!active) return;
      if (Array.isArray(apiProducts)) setProducts(apiProducts);
      if (Array.isArray(apiOrders)) setOrders(apiOrders);
      if (Array.isArray(apiUsers)) setUsers(apiUsers);
      setApiError('');
    }).catch(() => {
      if (active) setApiError('No se pudo conectar con el backend. Usando datos locales.');
    });

    return () => {
      active = false;
    };
  }, []);

  const syncApi = (operation) => {
    if (!hasApi) return;
    operation().then(() => setApiError('')).catch(() => {
      setApiError('No se pudo sincronizar con el backend. Revisa que la API este activa.');
    });
  };

  // Auth
  const login = (email, password) => {
    const user = users.find(u => u.email === email);
    // For this demo app passwords are not stored; accept the demo password '123456'
    if (user && password === '123456') {
      if (user.status === 'bloqueado') return { error: 'Tu cuenta está bloqueada. Contacta al administrador.' };
      setCurrentUser(user);
      return { success: true };
    }
    return { error: 'Credenciales incorrectas.' };
  };

  const logout = () => { setCurrentUser(null); setCart([]); setOrderDraft({
    packagingType: 'fundas',
    packagingId: '',
    customer: { name: '', phone: '', address: '', reference: '' },
    notes: '',
  }); };

  const register = (name, email, password) => {
    const exists = users.find(u => u.email === email);
    if (exists) return { error: 'El correo ya está registrado.' };
    const newUser = { id: Date.now(), name, email, role: 'cliente', status: 'activo', joinDate: new Date().toISOString().split('T')[0] };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    syncApi(() => api.createUser(newUser));
    return { success: true };
  };

  const createUser = (name, email, password, role = 'cliente') => {
    const exists = users.find(u => u.email === email);
    if (exists) return { error: 'El correo ya está registrado.' };
    const newUser = { id: Date.now(), name, email, role, status: 'activo', joinDate: new Date().toISOString().split('T')[0] };
    setUsers(prev => [...prev, newUser]);
    syncApi(() => api.createUser(newUser));
    return { success: true, user: newUser };
  };

  // Products (Admin & Vendor)
  const addProduct = (product) => {
    const newP = { 
      ...product, 
      id: Date.now(), 
      available: product.stock > 0,
      vendorId: currentUser?.id,
      vendorName: currentUser?.name
    };
    setProducts(prev => [...prev, newP]);
    syncApi(() => api.createProduct(newP));
  };

  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates, available: (updates.stock ?? p.stock) > 0, vendorId: updates.vendorId ?? p.vendorId, vendorName: updates.vendorName ?? p.vendorName } : p));
    syncApi(() => api.updateProduct(id, updates));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    syncApi(() => api.deleteProduct(id));
  };

  const updateStock = (id, qty) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: qty, available: qty > 0 } : p));
    syncApi(() => api.updateProduct(id, { stock: qty, available: qty > 0 }));
  };

  // Cart
  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty, image: product.image }];
    });
  };

  const removeFromCart = (productId) => setCart(prev => prev.filter(i => i.productId !== productId));
  const clearCart = () => setCart([]);

  const updateOrderDraft = (updates) => {
    setOrderDraft(prev => ({
      ...prev,
      ...updates,
      customer: {
        ...prev.customer,
        ...(updates.customer || {}),
      },
    }));
  };

  const resetOrderDraft = () => setOrderDraft({
    packagingType: 'fundas',
    packagingId: '',
    customer: { name: '', phone: '', address: '', reference: '' },
    notes: '',
  });

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  // Orders
  const createOrder = (orderData = {}) => {
    const { notes = '', packaging = null, customer = {} } = typeof orderData === 'string' ? { notes: orderData } : orderData;
    if (!cart.length) return;
    const packagingTotal = packaging?.precio ?? 0;
    const clientName = customer.name?.trim() || currentUser.name;
    const newOrder = {
      id: `PED-${String(orders.length + 1).padStart(3, '0')}`,
      clientId: currentUser.id,
      clientName,
      customer: {
        name: clientName,
        phone: customer.phone?.trim() || '',
        address: customer.address?.trim() || '',
        reference: customer.reference?.trim() || '',
      },
      packaging,
      items: cart.map(i => ({ productId: i.productId, name: i.name, qty: i.qty, price: i.price })),
      productTotal: cartTotal,
      packagingTotal,
      total: cartTotal + packagingTotal,
      status: 'pendiente',
      date: new Date().toISOString().split('T')[0],
      notes,
    };
    setOrders(prev => [newOrder, ...prev]);
    // Reduce stock
    cart.forEach(item => {
      setProducts(prev => prev.map(p => p.id === item.productId ? { ...p, stock: Math.max(0, p.stock - item.qty), available: Math.max(0, p.stock - item.qty) > 0 } : p));
    });
    syncApi(() => api.createOrder(newOrder));
    clearCart();
    resetOrderDraft();
    return newOrder;
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    syncApi(() => api.updateOrder(orderId, { status }));
  };

  // Users (Admin)
  const toggleUserBlock = (userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'activo' ? 'bloqueado' : 'activo' } : u));
    const user = users.find(u => u.id === userId);
    if (user) {
      syncApi(() => api.updateUser(userId, { status: user.status === 'activo' ? 'bloqueado' : 'activo' }));
    }
  };

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.minStock);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  return (
    <AppContext.Provider value={{
      currentUser, login, logout, register, createUser,
      apiError,
      products, addProduct, updateProduct, deleteProduct, updateStock,
      orders, createOrder, updateOrderStatus,
      users, toggleUserBlock,
      cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount,
      orderDraft, updateOrderDraft, resetOrderDraft,
      lowStockProducts, outOfStockProducts,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
