<template>
  <div class="prod-layout">

    <transition name="slide-fade">
      <div v-if="notification.show" :class="['alert-floating', 'alert-' + notification.type]">
        <div class="alert-content">
          <span class="alert-icon">
            {{ notification.type === 'success' ? '✅' : (notification.type === 'danger' ? '⛔' : '⚠️') }}
          </span>
          <span class="alert-msg">{{ notification.message }}</span>
        </div>
        <button @click="notification.show = false" class="alert-close">×</button>
      </div>
    </transition>

    <div v-if="dialog.show" class="modal-overlay dialog-overlay">
      <div class="modal-content dialog-content">
        <h3>{{ dialog.title }}</h3>
        <p>{{ dialog.message }}</p>
        <div class="modal-actions">
          <button @click="handleDialogCancel" class="btn-cancel">Batal</button>
          <button @click="handleDialogConfirm" class="btn-danger">
            {{ dialog.confirmText }}
          </button>
        </div>
      </div>
    </div>
    <nav class="prod-navbar">
      <div class="brand">👨‍🍳 KITCHEN & GUDANG</div>
      <div class="menu-items">
        <router-link to="/production/stocks" class="nav-link">📦 Stok & Belanja</router-link>
        <router-link to="/production/queue" class="nav-link">🍳 Antrian Masak</router-link>
      </div>
      <button @click="handleLogout" class="btn-logout">Logout</button>
    </nav>

    <main class="prod-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

// --- STATE ALERT & DIALOG ---
const notification = ref({ show: false, type: 'success', message: '' });
const dialog = ref({ show: false, title: '', message: '', type: 'confirm', confirmText: 'Ya', resolve: null });

// Helper: Alert
const triggerAlert = (message, type = 'success') => {
  notification.value = { show: true, type, message };
  setTimeout(() => { notification.value.show = false; }, 3000);
};

// Helper: Dialog
const useDialog = (title, message, type = 'danger', confirmText = 'Ya') => {
  return new Promise((resolve) => {
    dialog.value = { show: true, title, message, type, confirmText, resolve };
  });
};

const handleDialogConfirm = () => {
  dialog.value.show = false;
  if (dialog.value.resolve) dialog.value.resolve(true);
};

const handleDialogCancel = () => {
  dialog.value.show = false;
  if (dialog.value.resolve) dialog.value.resolve(false);
};
// ----------------------------

const handleLogout = async () => {
  // Ganti confirm bawaan
  const confirmed = await useDialog(
    'Konfirmasi Logout',
    'Keluar dari sistem Dapur & Gudang?',
    'danger',
    'Logout'
  );

  if (confirmed) {
    await authStore.logout();
    triggerAlert('Berhasil Logout', 'success');
    router.push('/login');
  }
};
</script>

<style scoped>
/* =========================================
   STYLE ALERT & DIALOG
   ========================================= */
.alert-floating {
  position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
  z-index: 11000;
  display: flex; align-items: center; gap: 15px;
  padding: 12px 25px; border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15); min-width: 300px;
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

/* DIALOG MODAL */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.5); z-index: 10000;
  display: flex; justify-content: center; align-items: center;
  backdrop-filter: blur(2px);
}
.modal-content {
  background: white; padding: 25px; border-radius: 12px; width: 350px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2); text-align: center;
}
.modal-content h3 { margin-top: 0; color: #d35400; margin-bottom: 10px; } /* Warna Oranye sesuai tema */
.modal-content p { color: #64748b; margin-bottom: 20px; }

.modal-actions { display: flex; gap: 10px; justify-content: center; }
.btn-cancel { padding: 10px 20px; background: #f1f5f9; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; color: #64748b; }
.btn-danger { padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-danger:hover { background: #dc2626; }

/* =========================================
   STYLE LAYOUT ASLI
   ========================================= */
.prod-layout { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }

.prod-navbar {
  background-color: #d35400; /* Warna Oranye Bata */
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  position: sticky; top: 0; z-index: 9999;
}

.brand { font-size: 1.2rem; font-weight: bold; display: flex; align-items: center; gap: 10px; }
.menu-items { display: flex; gap: 20px; }

.nav-link { color: rgba(255,255,255,0.8); text-decoration: none; font-weight: 500; transition: 0.3s; }
.nav-link:hover, .nav-link.router-link-active { color: white; font-weight: bold; border-bottom: 2px solid white; }

.btn-logout {
  background: #c0392b;
  border: none; padding: 8px 15px;
  color: white; border-radius: 4px; cursor: pointer; font-weight: bold;
}
.btn-logout:hover { background: #a93226; }

.prod-content {
  padding: 20px;
  background-color: #fcece4;
  min-height: calc(100vh - 60px);
}
</style>
