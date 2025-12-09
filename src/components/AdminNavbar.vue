<template>
  <header class="admin-navbar">

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
    <div class="navbar-left">
      <h3 class="page-title">{{ currentRouteName }}</h3>
    </div>

    <div class="navbar-right">
      <div class="user-dropdown" @click="toggleDropdown">

        <div class="user-info">
          <span class="user-name">{{ authStore.user?.username || 'ADMIN' }}</span>
          <span class="user-role">{{ authStore.user?.role }}</span>
        </div>

        <div class="avatar">
          {{ getInitials(authStore.user?.username || 'A') }}
        </div>

        <div v-if="isOpen" class="dropdown-menu">
          <div class="dropdown-header">
            <p>Halo, <strong>{{ authStore.user?.username }}</strong></p>
          </div>
          <hr>
          <button @click="handleLogout" class="dropdown-item danger">
            Logout
          </button>
        </div>

      </div>
    </div>

  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter, useRoute } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const isOpen = ref(false);

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

const currentRouteName = computed(() => {
  const names = {
    'admin-dashboard': 'Dashboard Overview',
    'admin-users': 'Manajemen Pengguna',
    'admin-products': 'Data Produk & Menu',
    'admin-ingredients': 'Stok Bahan Baku',
    'admin-reports': 'Laporan Keuangan'
  };
  return names[route.name] || 'Halaman Admin';
});

const getInitials = (name) => name.substring(0, 2).toUpperCase();
const toggleDropdown = () => isOpen.value = !isOpen.value;

// UPDATED LOGOUT LOGIC
const handleLogout = async () => {
  isOpen.value = false; // Tutup dropdown dulu

  // Gunakan Custom Dialog
  const confirmed = await useDialog('Konfirmasi Logout', 'Anda yakin ingin keluar dari sistem?', 'danger', 'Logout');

  if (confirmed) {
    await authStore.logout();
    triggerAlert('Anda berhasil logout', 'success');
    router.push('/login');
  }
};

const closeDropdown = (e) => {
  if (!e.target.closest('.user-dropdown')) isOpen.value = false;
};

onMounted(() => window.addEventListener('click', closeDropdown));
onUnmounted(() => window.removeEventListener('click', closeDropdown));
</script>

<style scoped>
/* =========================================
   STYLE ALERT & DIALOG (MODERN)
   ========================================= */
.alert-floating {
  position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
  z-index: 11000; /* Paling atas, di atas dropdown */
  display: flex; align-items: center; gap: 15px;
  padding: 12px 25px; border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15); min-width: 300px;
  animation: slideDown 0.4s ease-out;
  background: white; font-weight: 600; font-size: 0.95rem;
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
   STYLE NAVBAR ASLI
   ========================================= */
.admin-navbar {
  height: auto; min-height: 70px; width: 100%;
  position:sticky; top: 0; z-index: 9999;
  background-color: #ffffff; border-bottom: 1px solid #e3e3e3;
  display: flex; align-items: center; justify-content: space-between;
  padding: 5px 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}

.page-title { margin: 0; font-size: 1.2rem; color: #1e293b; font-weight: 700; }
.navbar-right { display: flex; align-items: center; gap: 20px; }

.user-dropdown {
  display: flex; align-items: center; gap: 12px; cursor: pointer; position: relative;
  padding: 6px 12px; border-radius: 8px; transition: 0.2s; border: 1px solid transparent;
}
.user-dropdown:hover { background-color: #f1f5f9; }

.user-info { text-align: right; line-height: 1.3; }
.user-name { display: block; font-weight: 600; color: #1e293b; font-size: 0.9rem; }
.user-role { display: block; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 600; }

.avatar {
  width: 40px; height: 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-weight: bold; font-size: 1rem; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
  border: 2px solid white;
}

/* DROPDOWN MENU */
.dropdown-menu {
  position: absolute; top: 70px; right: 0; width: 220px;
  background-color: #ffffff; border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 10px;
  padding: 10px 0; animation: fadeIn 0.2s ease; color: #1e293b; z-index: 10000;
}
.dropdown-header { padding: 12px 20px; color: #64748b; font-size: 0.9rem; }
.dropdown-header strong { color: #1e293b; }
hr { border: none; border-top: 1px solid #e2e8f0; margin: 5px 0; }

.dropdown-item {
  width: 100%; text-align: left; padding: 12px 20px; background: none; border: none;
  cursor: pointer; font-size: 0.9rem; color: #1e293b; transition: 0.2s; display: flex; align-items: center; gap: 10px;
}
.dropdown-item:hover { background-color: #f1f5f9; color: #10b981; }
.dropdown-item.danger { color: #ef4444; }
.dropdown-item.danger:hover { background-color: #fef2f2; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
