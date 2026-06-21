const API_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

export const hasApi = Boolean(API_URL);

async function request(path, options = {}) {
  if (!hasApi) return null;

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status} on ${path}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  getProducts: () => request('/products'),
  getOrders: () => request('/orders'),
  getUsers: () => request('/users'),
  createProduct: (product) => request('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  }),
  updateProduct: (id, updates) => request(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  deleteProduct: (id) => request(`/products/${id}`, {
    method: 'DELETE',
  }),
  createOrder: (order) => request('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  }),
  updateOrder: (id, updates) => request(`/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  createUser: (user) => request('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  }),
  updateUser: (id, updates) => request(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
};