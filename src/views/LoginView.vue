<template>
  <router-link to="/" class="back-arrow" title="Kembali ke Beranda">
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </router-link>
  <div class="login-page">
    <div class="login-card">
      <div class="form-side">
        <div class="header-text">
          <h3>Welcome Back,</h3>
          <h1>UMKM<span class="highlight">KULINER</span></h1>
          <p class="subtitle">Silakan login untuk memulai shift anda.</p>
        </div>

        <form @submit.prevent="handleLogin">

          <div class="input-group">
            <label>Username</label>
            <div class="input-wrapper">
              <input
                v-model="username"
                type="text"
                required
                placeholder=" "
              />
              <span class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </span>
            </div>
          </div>

          <div class="input-group">
            <label>Password</label>
            <div class="input-wrapper">
              <input
                v-model="password"
                type="password"
                required
                placeholder=" "
              />
              <span class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </span>
            </div>
          </div>

          <div class="options">
            <label class="checkbox-container">
              <input type="checkbox" v-model="rememberMe" />
              <span class="checkmark"></span>
              Remember Me
            </label>
          </div>

          <div v-if="errorMessage" class="error-msg">
            ⚠️ {{ errorMessage }}
          </div>

          <button type="submit" class="btn-login" :disabled="isLoading">
            {{ isLoading ? 'Memproses...' : 'Login Masuk' }}
          </button>

        </form>
      </div>

      <div class="image-side">
        <div class="image-overlay">
          <img
            src="/images/login.png"
            alt="POS Illustration"
            class="illustration"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const rememberMe = ref(false); // Definisikan variabel ini
const errorMessage = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    await authStore.login(username.value, password.value);

    if (authStore.isAdmin) router.push('/admin/dashboard');
    else if (authStore.isCashier) router.push('/cashier/pos');
    else if (authStore.isKitchen) router.push('/production/stocks');
    else router.push('/');

  } catch (error) {
    errorMessage.value = typeof error === 'string' ? error : 'Login Gagal.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;800&display=swap');

/* VARIABLE WARNA */
:root {
  --primary-color: #10b981;
  --primary-dark: #059669;
  --text-dark: #1e293b;
  --text-gray: #64748b;
}

.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: 'Poppins', sans-serif;
  padding: 20px;
}

.login-card {
  display: flex;
  width: 900px;
  height: 550px;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
  border: 1px solid rgba(16, 185, 129, 0.15);
  position: relative; /* Penting untuk posisi tombol kembali */
}

/* --- TOMBOL KEMBALI (GAYA BARU) --- */
.back-arrow {
  position: absolute;
  top: 25px;
  left: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f1f5f9;
  color: #64748b;
  transition: all 0.3s ease;
  z-index: 10; /* Agar di atas form */
}

.back-arrow:hover {
  background-color: #10b981; /* Hijau saat hover */
  color: white;
  transform: translateX(-3px); /* Efek geser kiri sedikit */
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
}

/* FORM SIDE */
.form-side {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative; /* Agar z-index back arrow berfungsi */
}

.header-text { margin-top: 20px; /* Sedikit margin top agar tidak nabrak tombol */ }

.header-text h3 { color: #64748b; font-weight: 500; font-size: 1.2rem; margin-bottom: 0; }
.header-text h1 { color: #1e293b; font-weight: 800; font-size: 2.8rem; margin: 0 0 10px 0; letter-spacing: -1px; }
.highlight { color: #10b981; }
.subtitle { font-size: 0.9rem; color: #94a3b8; margin-bottom: 40px; }

/* INPUT STYLES */
.input-group { margin-bottom: 25px; }
.input-group label { display: block; font-size: 0.85rem; color: #64748b; font-weight: 600; margin-bottom: 8px; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.input-wrapper input {
  width: 100%; border: none; border-bottom: 2px solid #e2e8f0;
  padding: 10px 0; padding-right: 30px; font-size: 1rem;
  color: #1e293b; font-weight: 500; outline: none; background: transparent;
  transition: border-color 0.3s;
}
.input-wrapper input:focus { border-bottom-color: #10b981; }
.input-wrapper .icon { position: absolute; right: 0; color: #94a3b8; transition: 0.3s; }
.input-wrapper input:focus + .icon { color: #10b981; }

/* OPTIONS & CHECKBOX */
.options { display: flex; align-items: center; margin-bottom: 30px; font-size: 0.85rem; color: #64748b; }
.checkbox-container { display: flex; align-items: center; cursor: pointer; user-select: none; }
.checkbox-container input { display: none; }
.checkmark {
  height: 16px; width: 16px; background-color: white; border: 2px solid #cbd5e1;
  border-radius: 4px; margin-right: 8px; display: inline-block; transition: 0.2s; position: relative;
}
.checkbox-container input:checked ~ .checkmark { background-color: #10b981; border-color: #10b981; }

/* BUTTON */
.btn-login {
  width: 100%; padding: 15px; background-color: #10b981; color: white;
  border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer;
  transition: background 0.3s, transform 0.2s; box-shadow: 0 5px 20px rgba(16, 185, 129, 0.3);
}
.btn-login:hover { background-color: #059669; transform: translateY(-2px); }
.btn-login:disabled { background-color: #cbd5e1; cursor: not-allowed; box-shadow: none; transform: none; }

.error-msg {
  color: #ef4444; font-size: 0.85rem; background-color: #fef2f2;
  padding: 10px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fee2e2;
}

/* IMAGE SIDE */
.image-side {
  flex: 1.1;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  display: flex; justify-content: center; align-items: center;
  position: relative; overflow: hidden; padding: 20px;
  border-left: 1px solid rgba(16, 185, 129, 0.1);
}
.image-side::before {
  content: ''; position: absolute; width: 450px; height: 450px;
  background: #d1fae5; border-radius: 50%; top: -80px; right: -80px; z-index: 1;
}
.image-overlay { position: relative; z-index: 2; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
.illustration {
  width: 120%; height: 120%; object-fit: cover; position: relative; z-index: 2;
  border-radius: 16px; border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2); opacity: 0.9;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .login-card { flex-direction: column; height: auto; width: 100%; }
  .image-side { display: none; }
  .form-side { padding: 40px 30px; }
  .header-text h1 { font-size: 2.2rem; }
}
</style>
