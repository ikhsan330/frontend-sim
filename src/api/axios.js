import axios from 'axios';

// 1. Set Base URL Flask Anda
// Pastikan port 5000 sesuai dengan backend Flask Anda
const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor Request (Penyisip Token Otomatis)
// Setiap kali kita request ke backend, kode ini akan cek apakah ada token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Interceptor Response (Penanganan Error Token Expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika backend menolak token (401 Unauthorized), hapus token dan paksa logout
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      // Opsional: Redirect ke halaman login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
