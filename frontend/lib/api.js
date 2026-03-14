const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Public API
export const publicApi = {
  getMarketer: (ref) => request(`/api/public/marketer/${encodeURIComponent(ref)}`),
  trackClick: (ref) => request(`/api/public/click/${encodeURIComponent(ref)}`, { method: 'POST' }),
  getContent: () => request('/api/public/content'),
};

// Auth API
export const authApi = {
  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  signup: (data) =>
    request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Marketer API
export const marketerApi = {
  getProfile: () => request('/api/marketer/profile'),
  updateWhatsApp: (whatsapp_number) =>
    request('/api/marketer/update-number', {
      method: 'PUT',
      body: JSON.stringify({ whatsapp_number }),
    }),
  getStats: () => request('/api/marketer/stats'),
};

// Admin API
export const adminApi = {
  getMarketers: () => request('/api/admin/marketers'),
  createMarketer: (data) =>
    request('/api/admin/marketers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMarketer: (id, data) =>
    request(`/api/admin/marketers/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMarketer: (id) =>
    request(`/api/admin/marketers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
  getAnalytics: () => request('/api/admin/analytics'),
  updateContent: (content) =>
    request('/api/admin/content', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),
  uploadHeroImage: async (file) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_URL}/api/admin/upload-hero`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
  uploadLogoImage: async (file) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_URL}/api/admin/upload-logo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
};
