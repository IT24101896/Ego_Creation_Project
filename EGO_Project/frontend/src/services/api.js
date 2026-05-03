import axios from 'axios';
import { Alert } from 'react-native';

const BASE_URL = 'http://10.73.229.142:3000/api'; // Your PC's IP address

const api = axios.create({
    baseURL: BASE_URL,
});

// Add Interceptor to add Token to every request
api.interceptors.request.use(
    async (config) => {
        // In a real app, you would use AsyncStorage here
        // For this demo, let's use a global variable or simpler storage if available
        if (global.userToken) {
            config.headers.Authorization = `Bearer ${global.userToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (userData) => api.post('/auth/register', userData);
export const getProducts = () => api.get('/products');
export const getOrders = () => api.get('/orders');
export const cancelOrder = (orderId) => api.put(`/orders/${orderId}/cancel`);

// Customization APIs
export const createCustomization = (data) => api.post('/customs', data);
export const getMyCustomizations = () => api.get('/customs/mycustoms');
export const getPendingCustomizations = () => api.get('/customs/admin/pending');
export const approveCustomization = (id, data) => api.put(`/customs/admin/${id}/approve`, data);
export const rejectCustomization = (id, data) => api.put(`/customs/admin/${id}/reject`, data);
export const requestPriceUpdate = (id, data) => api.put(`/customs/admin/${id}/price-update`, data);

// Custom Request APIs
export const createCustomRequest = (data) => api.post('/custom-requests', data);
export const getMyCustomRequests = () => api.get('/custom-requests/myrequests');
export const getAllCustomRequests = () => api.get('/custom-requests/admin/all');
export const provideQuote = (id, data) => api.put(`/custom-requests/admin/${id}/quote`, data);
export const respondToQuote = (id, data) => api.put(`/custom-requests/${id}/respond`, data);
export const updateRequestStatus = (id, data) => api.put(`/custom-requests/admin/${id}/status`, data);

// Media APIs
export const uploadMedia = (formData) => api.post('/media/upload', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
});
export const getPhotosByCategory = (category) => api.get(`/media/photos/${category}`);
export const getCategoryStats = () => api.get('/media/categories/stats');

export default api;
