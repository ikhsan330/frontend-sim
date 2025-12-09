<template>
  <div class="login-page">
  <router-link to="/" class="back-arrow" title="Kembali ke Beranda">
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </router-link>
    <transition name="slide-fade">
      <div v-if="notification.show" :class="['alert-floating', 'alert-' + notification.type]">
        <div class="alert-content">
          <span class="alert-icon">
            {{ notification.type === 'success' ? '✅' : '⛔' }}
          </span>
          <span class="alert-msg">{{ notification.message }}</span>
        </div>
        <button @click="notification.show = false" class="alert-close">×</button>
      </div>
    </transition>
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

// FORM STATE
const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const isLoading = ref(false);

// ALERT STATE
const notification = ref({ show: false, type: 'success', message: '' });

// Helper Alert
const triggerAlert = (message, type = 'success') => {
  notification.value = { show: true, type, message };
  setTimeout(() => { notification.value.show = false; }, 3000);
};

const handleLogin = async () => {
  isLoading.value = true;

  try {
    await authStore.login(username.value, password.value);

    // Sukses Login (Alert Hijau dulu, baru pindah)
    triggerAlert('Login Berhasil! Mengalihkan...', 'success');

    setTimeout(() => {
      if (authStore.isAdmin) router.push('/admin/dashboard');
      else if (authStore.isCashier) router.push('/cashier/pos');
      else if (authStore.isKitchen) router.push('/production/stocks');
      else router.push('/');
    }, 1000);

  } catch (error) {
    // Gagal Login (Alert Merah)
    const msg = typeof error === 'string' ? error : 'Username atau Password Salah!';
    triggerAlert(msg, 'danger');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;800&display=swap');

/* =========================================
   STYLE ALERT (FLOATING TOAST)
   ========================================= */
.alert-floating {
  position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
  z-index: 99999;
  display: flex; align-items: center; gap: 15px;
  padding: 12px 25px; border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15); min-width: 320px;
  animation: slideDown 0.4s ease-out;
  background: white; font-weight: 600; font-size: 0.95rem; color: #333;
}
.alert-content { flex: 1; display: flex; align-items: center; gap: 10px; }
.alert-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; opacity: 0.6; }
.alert-success { border: 2px solid #10b981; color: #065f46; background: #ecfdf5; }
.alert-danger { border: 2px solid #ef4444; color: #991b1b; background: #fef2f2; }

@keyframes slideDown {
  from { transform: translateX(-50%) translateY(-30px); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}

/* =========================================
   STYLE LOGIN PAGE
   ========================================= */
:root {
  --primary-color: #10b981;
  --primary-dark: #059669;
  --text-dark: #1e293b;
  --text-gray: #64748b;
}

.login-page {
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh; background-color: #f8fafc;
  font-family: 'Poppins', sans-serif; padding: 20px;
}

.login-card {
  display: flex; width: 900px; height: 550px;
  background: white; border-radius: 24px; overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
  border: 1px solid rgba(16, 185, 129, 0.15);
  position: relative;
}

/* Back Arrow Style */
.back-arrow {
  position: absolute; top: 25px; left: 25px;
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 50%;
  background-color: #f1f5f9; color: #64748b;
  transition: all 0.3s ease; z-index: 10;
}
.back-arrow:hover {
  background-color: #10b981; color: white;
  transform: translateX(-3px); box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
}

.form-side {
  flex: 1; padding: 60px 50px; display: flex; flex-direction: column; justify-content: center;
  position: relative;
}

.header-text { margin-top: 20px; }
.header-text h3 { color: #64748b; font-weight: 500; font-size: 1.2rem; margin-bottom: 0; }
.header-text h1 { color: #1e293b; font-weight: 800; font-size: 2.8rem; margin: 0 0 10px 0; letter-spacing: -1px; }
.highlight { color: #10b981; }
.subtitle { font-size: 0.9rem; color: #94a3b8; margin-bottom: 40px; }

/* Input Styles */
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

.options { display: flex; align-items: center; margin-bottom: 30px; font-size: 0.85rem; color: #64748b; }
.checkbox-container { display: flex; align-items: center; cursor: pointer; user-select: none; }
.checkbox-container input { display: none; }
.checkmark {
  height: 16px; width: 16px; background-color: white; border: 2px solid #cbd5e1;
  border-radius: 4px; margin-right: 8px; display: inline-block; transition: 0.2s; position: relative;
}
.checkbox-container input:checked ~ .checkmark { background-color: #10b981; border-color: #10b981; }

.btn-login {
  width: 100%; padding: 15px; background-color: #10b981; color: white;
  border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer;
  transition: background 0.3s, transform 0.2s; box-shadow: 0 5px 20px rgba(16, 185, 129, 0.3);
}
.btn-login:hover { background-color: #059669; transform: translateY(-2px); }
.btn-login:disabled { background-color: #cbd5e1; cursor: not-allowed; box-shadow: none; transform: none; }

/* Image Side */
.image-side {
  flex: 1.1; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
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

@media (max-width: 768px) {
  .login-card { flex-direction: column; height: auto; width: 100%; }
  .image-side { display: none; }
  .form-side { padding: 40px 30px; }
  .header-text h1 { font-size: 2.2rem; }
}
</style>
