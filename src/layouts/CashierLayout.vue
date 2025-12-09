<template>
  <div class="cashier-layout">

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
    <header class="cashier-header">
      <div class="brand">🛒 KASIR UMKM</div>
      <div class="user-menu">
        <span>Kasir: <strong>{{ authStore.user?.username }}</strong></span>
        <button @click="handleLogout" class="btn-logout">Keluar</button>
      </div>
    </header>

    <main class="cashier-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// --- STATE ALERT & DIALOG ---
const notification = ref({ show: false, type: 'success', message: '' });
const dialog = ref({ show: false, title: '', message: '', type: 'confirm', confirmText: 'Ya', resolve: null });

// Helper: Alert (Toast)
const triggerAlert = (message, type = 'success') => {
  notification.value = { show: true, type, message };
  setTimeout(() => { notification.value.show = false; }, 3000);
};

// Helper: Custom Dialog (Promise)
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
  // Ganti confirm() bawaan dengan Custom Dialog
  const confirmed = await useDialog(
    'Konfirmasi Logout',
    'Yakin ingin logout? Pastikan shift kasir sudah ditutup jika ingin pulang.',
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
.modal-content h3 { margin-top: 0; color: #1e293b; margin-bottom: 10px; }
.modal-content p { color: #64748b; margin-bottom: 20px; }

.modal-actions { display: flex; gap: 10px; justify-content: center; }
.btn-cancel { padding: 10px 20px; background: #f1f5f9; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; color: #64748b; }
.btn-danger { padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-danger:hover { background: #dc2626; }

/* =========================================
   STYLE LAYOUT ASLI
   ========================================= */
.cashier-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f2f5;
}

.cashier-header {
  background-color: #2c3e50;
  color: white;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  z-index: 50; /* Pastikan di bawah alert */
}

.brand { font-size: 1.2rem; font-weight: bold; }

.btn-logout {
  background: #c0392b;
  border: none;
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
  font-weight: bold;
}
.btn-logout:hover { background: #e74c3c; }

.cashier-content {
  flex: 1;
  overflow: hidden;
  padding: 10px;
}
</style>
