import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package, ShoppingBag, TrendingUp, Eye, Edit3, Trash2, Plus, X } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import './VendorDashboard.css';

export default function VendorDashboard() {
  const { products, orders, currentUser, addProduct, updateProduct, deleteProduct, updateStock, updateOrderStatus } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    minStock: '',
    description: '',
    image: '??'
  });

  const EMOJIS = ['??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'];

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
      stock: parseInt(form.stock, 10),
      minStock: parseInt(form.minStock, 10),
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

    setForm({ name: '', category: '', price: '', stock: '', minStock: '', description: '', image: '??' });
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setForm(product);
    setEditing(product.id);
    setShowForm(true);
  };

  const [selectedOrder, setSelectedOrder] = useState(null);

  const changeStock = (productId, value) => {
    const qty = parseInt(value, 10);
    if (Number.isNaN(qty) || qty < 0) return;
    updateStock(productId, qty);
  };

  const handleOrderAction = (orderId, action) => {
    if (action === 'aceptar') updateOrderStatus(orderId, 'aceptado');
    if (action === 'rechazar') updateOrderStatus(orderId, 'rechazado');
    if (action === 'listo') updateOrderStatus(orderId, 'listo');
  };

  const stats = [
    { label: 'Mis Productos', value: vendorProducts.length, icon: Package, badge: 'badge-info' },
    { label: 'Ventas Totales', value: `$${totalSales.toFixed(2)}`, icon: TrendingUp, badge: 'badge-warning' },
    { label: 'Pedidos', value: totalOrders, icon: ShoppingBag, badge: 'badge-info' },
    { label: 'Stock Bajo', value: lowStock, icon: Eye, badge: 'badge-danger' }
  ];

  return (
    <div className="vendor-dashboard">
      <div className="vendor-dashboard__top">
        <div>
          <h1>Dashboard Vendedor</h1>
          <p>Bienvenido, {currentUser?.name}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditing(null); setForm({ name: '', category: '', price: '', stock: '', minStock: '', description: '', image: '??' }); }}>
          <Plus size={18} /> Agregar Producto
        </button>
      </div>

      <div className="vendor-dashboard__stats">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon">
              <stat.icon size={22} />
            </div>
            <div className="stat-info">
              <p>{stat.label}</p>
              <h3>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card vendor-dashboard__form">
          <div className="page-header">
            <div>
              <h2>{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
              <p>Agrega los datos básicos para publicar tu producto.</p>
            </div>
            <button className="btn btn-secondary" onClick={() => { setShowForm(false); setEditing(null); }}><X size={18} /> Cerrar</button>
          </div>

          <form onSubmit={handleSubmit} className="vendor-dashboard__product-form">
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. Suspiros de vainilla" />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Seleccionar categoría</option>
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div className="form-group">
              <label>Precio</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Stock mínimo</label>
              <input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} placeholder="0" />
            </div>
            <div className="form-group form-group--wide">
              <label>Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ej. Caja de 12 suspiros hechos a mano." rows={3} />
            </div>
            <div className="form-group form-group--wide">
              <label>Emoji del producto</label>
              <div className="emoji-picker">
                {EMOJIS.map((emoji) => (
                  <button key={emoji} type="button" className={`emoji-button ${form.image === emoji ? 'emoji-button--active' : ''}`} onClick={() => setForm({ ...form, image: emoji })}>{emoji}</button>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{editing ? 'Actualizar producto' : 'Crear producto'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="vendor-dashboard__section card">
        <div className="section-head">
          <div>
            <h2>Mis productos</h2>
            <p className="section-subtitle">Gestiona tu stock y revisa qué productos están listos para la venta.</p>
          </div>
          <div className="section-tag">{vendorProducts.length} productos</div>
        </div>

        {vendorProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">??</div>
            <h3>No tienes productos aún</h3>
            <p>Crea tu primer producto para que tus clientes puedan comprar.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>Crear Producto</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vendorProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-avatar">
                          {product.image && (product.image.startsWith('http') || product.image.startsWith('data:') ? <img src={product.image} alt={product.name} /> : <span>{product.image}</span>)}
                        </div>
                        <div>
                          <strong>{product.name}</strong>
                          <p className="text-muted">{product.description || 'Sin descripción'}</p>
                        </div>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      <div className="stock-row">
                        <input type="number" value={product.stock} onChange={(e) => changeStock(product.id, e.target.value)} className="stock-input" />
                        <span className={`badge ${product.stock <= product.minStock ? 'badge-danger' : product.stock <= product.minStock * 1.5 ? 'badge-warning' : 'badge-success'}`}>{product.stock} uds</span>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <button className="btn btn-secondary" onClick={() => handleEdit(product)}><Edit3 size={14} /> Editar</button>
                      <button className="btn btn-danger" onClick={() => { if (window.confirm('¿Eliminar este producto?')) deleteProduct(product.id); }}><Trash2 size={14} /> Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="vendor-dashboard__section card">
        <div className="section-head">
          <div>
            <h2>Pedidos</h2>
            <p className="section-subtitle">Acepta, rechaza y revisa quién hizo cada pedido.</p>
          </div>
          <div className="section-tag">{vendorOrders.length} pedidos</div>
        </div>

        {vendorOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">??</div>
            <h3>No hay pedidos aún</h3>
            <p>Cuando recibas pedidos, aparecerán aquí para que los gestiones.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vendorOrders.slice(0, 8).map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.clientName}</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td><span className={`badge ${order.status === 'entregado' ? 'badge-success' : order.status === 'pendiente' ? 'badge-danger' : 'badge-info'}`}>{order.status}</span></td>
                    <td>{order.date}</td>
                    <td className="actions-cell">
                      <button className="btn btn-success" onClick={() => handleOrderAction(order.id, 'aceptar')}>Aceptar</button>
                      <button className="btn btn-danger" onClick={() => handleOrderAction(order.id, 'rechazar')}>Rechazar</button>
                      <button className="btn btn-secondary" onClick={() => setSelectedOrder(order)}>Ver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Pedido {selectedOrder.id}</h2>
                <p className="section-subtitle">Cliente: {selectedOrder.clientName}</p>
              </div>
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Cerrar</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Fecha</label>
                <p>{selectedOrder.date}</p>
              </div>
              <div className="form-group">
                <label>Estado</label>
                <p>{selectedOrder.status}</p>
              </div>
              <div className="form-group">
                <label>Productos</label>
                <div className="order-items">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="order-item-row">
                      <span>{item.name}</span>
                      <span>{item.qty} x ${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Cerrar</button>
              <button className="btn btn-success" onClick={() => { handleOrderAction(selectedOrder.id, 'listo'); setSelectedOrder(null); }}>Marcar listo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
