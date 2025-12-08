<template>
  <aside :class="['sidebar', { 'collapsed': isCollapsed }]">

    <div class="sidebar-header">
      <div class="brand-wrapper">
        <div class="brand-full" v-if="!isCollapsed">
          SIM<span class="highlight">POS</span>
        </div>
        <div class="brand-mini" v-else>
          S<span class="highlight">P</span>
        </div>
      </div>
    </div>

    <div class="toggle-wrapper" @click="toggleSidebar">
      <div class="toggle-btn">
        <span :class="['arrow', { 'flipped': isCollapsed }]"></span>
      </div>
    </div>

    <nav class="sidebar-nav">

      <div class="nav-section">
        <div class="nav-title" v-if="!isCollapsed">Main Menu</div>
        <router-link to="/admin/dashboard" class="nav-item" title="Dashboard">
          <span class="icon-box">📊</span>
          <span class="label" v-if="!isCollapsed">Dashboard</span>
        </router-link>
      </div>

      <div class="nav-section">
        <div class="nav-title" v-if="!isCollapsed">Master Data</div>
        <router-link to="/admin/users" class="nav-item" title="Kelola Users">
          <span class="icon-box">👥</span>
          <span class="label" v-if="!isCollapsed">Kelola Users</span>
        </router-link>
      </div>

      <div class="nav-section">
        <div class="nav-title" v-if="!isCollapsed">Produksi</div>
        <router-link to="/admin/products" class="nav-item" title="Produk & Menu">
          <span class="icon-box">🍔</span>
          <span class="label" v-if="!isCollapsed">Produk & Menu</span>
        </router-link>
        <router-link to="/admin/ingredients" class="nav-item" title="Bahan Baku">
          <span class="icon-box">📦</span>
          <span class="label" v-if="!isCollapsed">Bahan Baku</span>
        </router-link>
      </div>

      <div class="nav-section">
        <div class="nav-title" v-if="!isCollapsed">Laporan</div>
        <router-link to="/admin/reports" class="nav-item" title="Laporan Keuangan">
          <span class="icon-box">📈</span>
          <span class="label" v-if="!isCollapsed">Laporan Keuangan</span>
        </router-link>
      </div>
    </nav>

  </aside>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['toggle']);
const isCollapsed = ref(false);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
  emit('toggle', isCollapsed.value);
};

</script>

<style scoped>
/* KONFIGURASI WARNA (SOLUSI KONTRAS TINGGI) */
:root {
  --sb-bg: #ffffff;
  --sb-text: #64748b;       /* Abu-abu teks biasa */
  --sb-logo-text: #1e293b;
  --sb-hover-bg: #f1f5f9;   /* Abu muda saat hover */

  --sb-border: #e2e8f0;
  --sb-shadow: 4px 0 24px rgba(0,0,0,0.05);

  /* WARNA ACTIVE STATE (Saya tebalkan supaya JELAS) */
  --active-bg-solid: #d1fae5;  /* Hijau Mint Solid (Jelas Terlihat) */
  --active-text: #059669;      /* Hijau Tua (Kontras Tinggi) */
  --active-border: #10b981;    /* Garis Hijau Murni */
}

/* 1. LAYOUT SIDEBAR */
.sidebar {
  width: 260px;
  height: 100vh;
  background-color: var(--sb-bg);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 999;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-right: 1px solid var(--sb-border);
  box-shadow: var(--sb-shadow);
}
.sidebar.collapsed { width: 86px; }

/* 2. HEADER LOGO */
.sidebar-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--sb-border);
  flex-shrink: 0;
}
.brand-full, .brand-mini {
  font-family: 'Poppins', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--sb-logo-text);
  letter-spacing: -1px;
}
.highlight { color: #10b981; }

/* 3. TOMBOL TOGGLE */
.toggle-wrapper {
  position: absolute;
  top: 20px; right: -5px; z-index: 10; cursor: pointer;
}
.toggle-btn {
  width: 28px; height: 28px; background: white;
  border: 1px solid var(--sb-border); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1); transition: 0.2s;
}
.toggle-wrapper:hover .toggle-btn { transform: scale(1.1); border-color: #10b981; }
.arrow {
  border: solid #64748b; border-width: 0 2px 2px 0; display: inline-block; padding: 3px;
  transform: rotate(135deg); transition: transform 0.3s; margin-left: 2px;
}
.arrow.flipped { transform: rotate(-45deg); margin-left: -2px; }

/* 4. NAVIGASI */
.sidebar-nav {
  flex: 1; overflow-y: auto; overflow-x: hidden; padding: 10px 12px;
}
.nav-section { margin-bottom: 15px; }
.nav-title {
  padding: 0 15px 8px; font-size: 0.7rem; text-transform: uppercase;
  letter-spacing: 1px; font-weight: 700; color: #94a3b8;
}

/* BASE STYLE NAV ITEM */
.nav-item {
  display: flex; align-items: center; padding: 12px 15px; margin-bottom: 5px;
  color: var(--sb-text); text-decoration: none; font-weight: 500;
  border-radius: 8px; /* Sudut sedikit membulat */
  transition: all 0.2s ease; position: relative;
  border: 1px solid transparent; /* Persiapan border */
}

.sidebar.collapsed .nav-item { padding: 12px 0; justify-content: center; }
.icon-box { width: 24px; font-size: 1.2rem; text-align: center; margin-right: 12px; }
.sidebar.collapsed .icon-box { margin-right: 0; font-size: 1.4rem; }

/* --- ACTIVE STATE (FIXED) --- */
/* Kita gunakan selector ganda agar prioritas tinggi */
.nav-item.router-link-active,
.nav-item.router-link-exact-active {
  background-color: var(--active-bg-solid) !important; /* Hijau Mint Solid */
  color: var(--active-text) !important; /* Hijau Tua */
  font-weight: 500;
  border: 1px solid var(--active-border); /* Border Hijau Tipis */
  box-shadow: 0 2px 5px #10b981;
}

/* Pastikan icon juga berubah warna */
.nav-item.router-link-active .icon-box {
  color: var(--active-text) !important;
}

/* Hover State (Hanya jika TIDAK aktif) */
.nav-item:not(.router-link-active):hover {
    background-color: var(--active-bg-solid) !important; /* Hijau Mint Solid */
  color: var(--active-text) !important; /* Hijau Tua */
  font-weight: 500;
  border: 1px solid var(--active-border); /* Border Hijau Tipis */
  box-shadow: 0 2px 5px #10b981;
}

/* Pastikan icon juga berubah jadi hijau saat hover */
.nav-item:not(.router-link-active):hover .icon-box {
  color: var(--active-text);
}

/* Scrollbar */
.sidebar-nav::-webkit-scrollbar { width: 4px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.sidebar-nav::-webkit-scrollbar-track { background: transparent; }
</style>
