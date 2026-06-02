import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Package, ShoppingBag, TrendingUp, Eye, Edit3, Trash2, Plus, X } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';

export default function VendorDashboard() {
  const { products, orders, currentUser, addProduct, updateProduct, deleteProduct } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    minStock: '',
    description: '',
    image: '🍬'
  });

  const EMOJIS = ['🍬', '🍫', '🧁', '🍭', '🍮', '🎂', '🍰', '🍩', '🍪', '💝', '🌸', '🦄'];

  const vendorProducts = products.filter(p => p.vendorId === currentUser?.id);
  const vendorOrders = orders.filter(o => 
    o.items.some(item => vendorProducts.some(p => p.id === item.productId))
  );

  const totalSales = vendorOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = vendorOrders.length;
  const lowStock = vendorProducts.filter(p => p.stock > 0 && p.stock <= p.minStock).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.name.trim() || !form.category || !form.price || !form.stock || !form.minStock) {
      alert('Por favor completa todos los campos');
      return;
    }

    const productData = {
      name: form.name,
      category: form.category,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      minStock: parseInt(form.minStock),
      description: form.description,
      image: form.image,
      vendorId: currentUser.id,
      vendorName: currentUser.name
    };

    if (editing) {
      updateProduct(editing, productData);
      setEditing(null);
    } else {
      addProduct(productData);
    }

    setForm({ name: '', category: '', price: '', stock: '', minStock: '', description: '', image: '🍬' });
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setForm(product);
    setEditing(product.id);
    setShowForm(true);
  };

  const stats = [
    { label: 'Mis Productos', value: vendorProducts.length, icon: Package, color: '#eaf4fd', iconColor: '#1a7abc' },
    { label: 'Ventas Totales', value: `$${totalSales.toFixed(2)}`, icon: TrendingUp, color: '#fde8f0', iconColor: '#c93261' },
    { label: 'Pedidos', value: totalOrders, icon: ShoppingBag, color: '#fef8e7', iconColor: '#c17d00' },
    { label: 'Stock Bajo', value: lowStock, icon: Eye, color: '#ffe8e8', iconColor: '#c92a2a' }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Vendedor</h1>
          <p className="text-gray-500">Bienvenido, {currentUser?.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6" style={{ borderLeft: `4px solid ${stat.iconColor}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div style={{ backgroundColor: stat.color }} className="p-3 rounded-lg">
                  <stat.icon size={24} color={stat.iconColor} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Product Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditing(null);
              setForm({ name: '', category: '', price: '', stock: '', minStock: '', description: '', image: '🍬' });
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus size={20} /> Agregar Producto
          </button>
        </div>

        {/* Product Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{editing ? 'Editar' : 'Nuevo'} Producto</h2>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Categoría</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                type="number"
                placeholder="Precio"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Stock Mínimo"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Descripción"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm col-span-2"
              />
              <div className="col-span-2">
                <label className="text-sm text-gray-600 mb-2 block">Emoji</label>
                <div className="flex gap-2 flex-wrap">
                  {EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm({ ...form, image: emoji })}
                      className={`text-2xl p-2 rounded ${form.image === emoji ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="col-span-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium">
                {editing ? 'Actualizar' : 'Crear'} Producto
              </button>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold">Mis Productos ({vendorProducts.length})</h2>
          </div>
          
          {vendorProducts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No tienes productos aún. ¡Crea tu primer producto!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorProducts.map(product => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                            <img src={product.image && (product.image.startsWith('http') || product.image.startsWith('data:') ? product.image : encodeURI(product.image))}
                              alt={product.name}
                              onError={(e) => { e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='100%25' height='100%25' fill='%23f3eae9'/%3E%3C/text%3E%3C/svg%3E" }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </div>
                          <span className="font-medium text-gray-800">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">${product.price}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.stock <= product.minStock ? 'bg-red-100 text-red-800' :
                          product.stock <= product.minStock * 1.5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {product.stock} unidades
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('¿Eliminar este producto?')) deleteProduct(product.id);
                          }}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        {vendorOrders.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold">Pedidos Recientes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Pedido</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorOrders.slice(0, 5).map(order => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-800">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.clientName}</td>
                      <td className="px-6 py-4 font-medium text-gray-800">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'entregado' ? 'bg-green-100 text-green-800' :
                          order.status === 'pendiente' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
