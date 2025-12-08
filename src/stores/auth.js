import { defineStore } from 'pinia';
import apiClient from '../api/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token') || null,
    user: JSON.parse(localStorage.getItem('user_data')) || null,
    role: localStorage.getItem('user_role') || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.role === 'admin',
    isCashier: (state) => state.role === 'cashier',
    isKitchen: (state) => state.role === 'kitchen',
  },

  actions: {
    async login(username, password) {
      try {
        // Sesuaikan URL ini dengan prefix blueprint di Flask Anda
        // Jika di __init__.py modul auth tidak ada url_prefix, maka '/auth/login' atau '/login'
        // Mari kita coba path '/login' sesuai routes.py,
        // tapi nanti kalau 404 kita ubah jadi '/auth/login'
        const response = await apiClient.post('/auth/login', {
          username,
          password
        });

        const { access_token, user } = response.data;

        // 1. Simpan ke State Pinia
        this.token = access_token;
        this.user = user;
        this.role = user.role;

        // 2. Simpan ke LocalStorage (biar di-refresh tidak hilang)
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user_data', JSON.stringify(user));
        localStorage.setItem('user_role', user.role);

        return true; // Login sukses
      } catch (error) {
        console.error("Login Failed:", error.response?.data?.message);
        throw error.response?.data?.message || "Login Gagal";
      }
    },

    async logout() {
      try {
        // Panggil endpoint logout di backend untuk blacklist token
        await apiClient.post('/auth/logout');
      } catch (error) {
        console.error("Logout error", error);
      } finally {
        // Bersihkan data di frontend (baik backend sukses atau gagal)
        this.token = null;
        this.user = null;
        this.role = null;
        localStorage.clear();
      }
    }
  }
});
