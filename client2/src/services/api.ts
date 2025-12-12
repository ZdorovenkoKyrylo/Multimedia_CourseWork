import axios from 'axios';

// Base API URL - adjust as needed
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============ Product API ============
export const productAPI = {
  getAll: async (params?: { category?: string; minPrice?: number; maxPrice?: number; search?: string }) => {
    const response = await api.get('/product', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/product/${id}`);
    return response.data;
  },
  
  create: async (product: any) => {
    const response = await api.post('/product', product);
    return response.data;
  },
  
  update: async (id: string, product: any) => {
    const response = await api.patch(`/product/${id}`, product);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
  },
};

// ============ Order API ============
export const orderAPI = {
  getAll: async (params?: { userId?: string; status?: string }) => {
    const response = await api.get('/order', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/order/${id}`);
    return response.data;
  },
  
  create: async (order: any) => {
    const response = await api.post('/order', order);
    return response.data;
  },
  
  update: async (id: string, order: any) => {
    const response = await api.patch(`/order/${id}`, order);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/order/${id}`);
    return response.data;
  },
};

// ============ User API ============
export const userAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },

  getAll: async (params?: { role?: string; email?: string }) => {
    const response = await api.get('/users', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  create: async (user: any) => {
    const response = await api.post('/users', user);
    return response.data;
  },
  
  update: async (id: string, user: any) => {
    const response = await api.patch(`/users/${id}`, user);
    return response.data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/users/${id}`);
  },
};

// ============ Review API ============
export const reviewAPI = {
  getAll: async (params?: { productId?: string; userId?: string; minRating?: number }) => {
    const response = await api.get('/review', { params });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/review/${id}`);
    return response.data;
  },
  
  create: async (review: any) => {
    // Validate orderId
    if (!review.orderId || typeof review.orderId !== 'string' || review.orderId.length !== 24) {
      throw new Error('orderId is required and must be a valid MongoDB ObjectId string');
    }
    // Validate userId
    if (!review.userId || typeof review.userId !== 'string' || review.userId.length !== 24) {
      throw new Error('userId is required and must be a valid MongoDB ObjectId string');
    }
    const response = await api.post('/review', review);
    return response.data;
  },
  
  update: async (id: string, review: any) => {
    const response = await api.patch(`/review/${id}`, review);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/review/${id}`);
    return response.data;
  },
};


// ============ Assistant API ============
export const assistantAPI = {
  query: async (query: string) => {
    const response = await api.post('/assistant/query', { query });
    return response.data;
  },

  sendAudio: async (
    audioBlob: Blob,
    onAssistantResult?: (result: { text: string; response: any }) => void
  ) => {
    try {
      // Send audio to /assistant/speech-to-text
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      const sttResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/assistant/speech-to-text`, {
        method: 'POST',
        body: formData,
      });
      const sttData = await sttResponse.json();
      if (!sttData.text) {
        if (typeof onAssistantResult === 'function') {
          onAssistantResult({ text: '', response: { error: 'Could not recognize speech.' } });
        }
        return;
      }
      // Send recognized text to assistant/query
      const assistantResult = await assistantAPI.query(sttData.text);
      if (typeof onAssistantResult === 'function') {
        onAssistantResult({ text: sttData.text, response: assistantResult });
      }
    } catch (err) {
      if (typeof onAssistantResult === 'function') {
        onAssistantResult({ text: '', response: { error: err instanceof Error ? err.message : String(err) } });
      }
    }
  },
};

export default api;
