<template>
  <header class="admin-navbar">

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

const handleLogout = async () => {
  if (confirm('Yakin ingin logout?')) {
    await authStore.logout();
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
.admin-navbar {
  /* UKURAN & POSISI */
  height: auto;
  min-height: 70px;
  width: 100%;
  position:sticky;
  top: 0;

  /* LAPISAN */
  z-index: 9999;

  /* WARNA BACKGROUND */
  background-color: #ffffff;
  border-bottom: 1px solid #e3e3e3;

  /* LAYOUT FLEX */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 30px;

  /* Shadow */
  box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}

/* KIRI */
.page-title {
  margin: 0;
  font-size: 1.2rem;
  color: #1e293b; /* Hitam Slate */
  font-weight: 700;
}

/* KANAN */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  position: relative;
  padding: 6px 12px;
  border-radius: 8px;
  transition: 0.2s;
  border: 1px solid transparent;
}

.user-dropdown:hover {
  background-color: #f1f5f9; /* Abu muda saat hover */
}

.user-info {
  text-align: right;
  line-height: 1.3;
}

.user-name {
  display: block;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.9rem;
}

.user-role {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
}

.avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
  border: 2px solid white;
}

/* DROPDOWN MENU */
.dropdown-menu {
  position: absolute;
  top: 70px; /* Geser sedikit ke bawah */
  right: 0;
  width: 220px;
  background-color: #ffffff; /* Putih Solid */
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  border-radius: 10px;
  padding: 10px 0;
  animation: fadeIn 0.2s ease;
  color: #1e293b;
  z-index: 10000; /* Di atas navbar */
}

.dropdown-header {
  padding: 12px 20px;
  color: #64748b;
  font-size: 0.9rem;
}

.dropdown-header strong { color: #1e293b; }

hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 5px 0;
}

.dropdown-item {
  width: 100%;
  text-align: left;
  padding: 12px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: #1e293b;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dropdown-item:hover {
  background-color: #f1f5f9;
  color: #10b981;
}

.dropdown-item.danger { color: #ef4444; }
.dropdown-item.danger:hover { background-color: #fef2f2; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
