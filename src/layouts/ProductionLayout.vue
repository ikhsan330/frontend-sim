<template>
  <div class="prod-layout">
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  if(confirm('Logout dari Dapur?')) {
    await authStore.logout();
    router.push('/login');
  }
};
</script>

<style scoped>
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
}
.brand { font-size: 1.2rem; font-weight: bold; display: flex; align-items: center; gap: 10px; }
.menu-items { display: flex; gap: 20px; }
.nav-link { color: rgba(255,255,255,0.8); text-decoration: none; font-weight: 500; transition: 0.3s; }
.nav-link:hover, .nav-link.router-link-active { color: white; font-weight: bold; border-bottom: 2px solid white; }
.btn-logout { background: #c0392b; border: none; padding: 8px 15px; color: white; border-radius: 4px; cursor: pointer; }
.prod-content { padding: 20px; background-color: #fcece4; min-height: calc(100vh - 60px); }
</style>
