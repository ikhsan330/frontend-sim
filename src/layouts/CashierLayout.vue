<template>
  <div class="cashier-layout">
    <header class="cashier-header">
      <div class="brand">🛒 POS SYSTEM</div>
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
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  if(confirm('Yakin ingin logout? Pastikan shift sudah ditutup jika ingin pulang.')) {
    await authStore.logout();
    router.push('/login');
  }
};
</script>

<style scoped>
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
}

.cashier-content {
  flex: 1;
  overflow: hidden; /* Supaya scroll bar diatur per komponen */
  padding: 10px;
}
</style>
