import React from 'react';
import { useApp } from '../context/AppContext';
import { DollarSign, PackageCheck, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2E6B7A', '#4A8FA0', '#1E4F5C', '#8DBCC7', '#D6E8EC', '#B8D6DD'];

export default function ReportsAdmin() {
  const { orders, products } = useApp();

  // Sales by status
  const statusData = ['pendiente', 'aceptado', 'en preparacion', 'listo', 'entregado', 'rechazado'].map(s => ({
    name: s,
    total: orders.filter(o => o.status === s).reduce((sum, o) => sum + o.total, 0),
    count: orders.filter(o => o.status === s).length,
  }));

  // Top products
  const productById = new Map(products.map(product => [String(product.id), product]));
  const productSales = {};
  orders.forEach(o => {
    if (o.status !== 'rechazado') {
      o.items.forEach(item => {
        const productId = String(item.productId);
        if (productById.has(productId)) {
          productSales[productId] = (productSales[productId] || 0) + item.qty;
        }
      });
    }
  });
  const topProducts = Object.entries(productSales)
    .map(([productId, qty]) => ({ ...productById.get(productId), qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6);

  // Revenue by day
  const revenueByDay = {};
  orders.filter(o => o.status === 'entregado').forEach(o => {
    revenueByDay[o.date] = (revenueByDay[o.date] || 0) + o.total;
  });
  const revenueData = Object.entries(revenueByDay).map(([date, total]) => ({ date, total: parseFloat(total.toFixed(2)) })).sort((a, b) => a.date.localeCompare(b.date));

  const totalRevenue = orders.filter(o => o.status === 'entregado').reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'entregado').length;
  const statCards = [
    { label: 'Ingresos totales', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign },
    { label: 'Total pedidos', value: totalOrders, icon: PackageCheck },
    { label: 'Pedidos entregados', value: deliveredOrders, icon: CheckCircle },
  ];

  return (
    <div>
      <div className="page-header">
        <div><h1>Reportes</h1><p>Análisis del negocio</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--pink-100)', width: 50, height: 50 }}>
              <s.icon size={24} color="var(--pink-500)" />
            </div>
            <div className="stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Revenue chart */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 20 }}>Ingresos por día</h3>
          {revenueData.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}><p>Sin datos de ingresos aún</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => [`$${v}`, 'Ingresos']} />
                <Bar dataKey="total" fill="var(--pink-500)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status pie */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: 20 }}>Pedidos por estado</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData.filter(d => d.count > 0)} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, count }) => `${name}: ${count}`} labelLine={false}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 20 }}>Productos más vendidos</h3>
        {topProducts.length === 0 ? (
          <div className="empty-state"><p>Sin ventas registradas aún</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {topProducts.map((p, i) => (
              <div key={p.id} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--gray-100)' }}>
                  <img
                    src={p.image && (p.image.startsWith('http') || p.image.startsWith('data:') ? p.image : encodeURI(p.image))}
                    alt={p.name}
                    onError={(e) => { e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='100%25' height='100%25' fill='%23f3eae9'/%3E%3C/svg%3E" }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                  <p style={{ color: 'var(--pink-500)', fontWeight: 700 }}>{p.qty} {p.qty === 1 ? 'vendido' : 'vendidos'}</p>
                </div>
                <span style={{ marginLeft: 'auto', width: 26, height: 26, background: i < 3 ? 'var(--pink-500)' : 'var(--gray-200)', color: i < 3 ? 'white' : 'var(--gray-400)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>#{i+1}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
