import { create } from 'zustand';
import api, { setAccessToken } from '../api/axios';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    set({ user: data.user, isAuthenticated: true, loading: false });
    return data;
  },

  register: async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setAccessToken(data.accessToken);
    set({ user: data.user, isAuthenticated: true, loading: false });
    return data;
  },

  logout: async () => {
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  checkAuth: async () => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/refresh');
      setAccessToken(data.accessToken);
      set({ user: data.user, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token, password) => {
    const { data } = await api.put(`/auth/reset-password/${token}`, { password });
    setAccessToken(data.accessToken);
    set({ user: data.user, isAuthenticated: true, loading: false });
    return data;
  },
}));

export default useAuthStore;
