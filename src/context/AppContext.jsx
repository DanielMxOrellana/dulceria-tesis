import React, { createContext, useContext, useState } from 'react';
import { PRODUCTS_INITIAL, ORDERS_INITIAL, USERS_INITIAL } from '../data/mockData';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState(PRODUCTS_INITIAL);
  const [orders, setOrders] = useState(ORDERS_INITIAL);
  const [users, setUsers] = useState(USERS_INITIAL);
  const [cart, setCart] = useState([]);
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

  const register = (name, email, password, role = 'cliente') => {
    const exists = users.find(u => u.email === email);
    if (exists) return { error: 'El correo ya está registrado.' };
    const newUser = { id: Date.now(), name, email, role, status: 'activo', joinDate: new Date().toISOString().split('T')[0] };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const createUser = (name, email, password, role = 'cliente') => {
    const exists = users.find(u => u.email === email);
    if (exists) return { error: 'El correo ya está registrado.' };
    const newUser = { id: Date.now(), name, email, role, status: 'activo', joinDate: new Date().toISOString().split('T')[0] };
    setUsers(prev => [...prev, newUser]);
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
  };

  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates, available: (updates.stock ?? p.stock) > 0, vendorId: updates.vendorId ?? p.vendorId, vendorName: updates.vendorName ?? p.vendorName } : p));
  };

  const deleteProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id));

  const updateStock = (id, qty) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: qty, available: qty > 0 } : p));
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
    clearCart();
    resetOrderDraft();
    return newOrder;
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // Users (Admin)
  const toggleUserBlock = (userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'activo' ? 'bloqueado' : 'activo' } : u));
  };

  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.minStock);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  return (
    <AppContext.Provider value={{
      currentUser, login, logout, register, createUser,
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
