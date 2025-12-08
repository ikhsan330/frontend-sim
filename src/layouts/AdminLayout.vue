<template>
  <div class="admin-layout">
    <AdminSidebar @toggle="handleSidebarToggle" />

    <div class="main-wrapper" :class="{ 'expanded': isSidebarCollapsed }">

      <AdminNavbar />

      <main class="content-body">
        <RouterView />
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import AdminSidebar from '../components/AdminSidebar.vue';
import AdminNavbar from '../components/AdminNavbar.vue'; // Import Navbar Baru

const isSidebarCollapsed = ref(false);

const handleSidebarToggle = (collapsedStatus) => {
  isSidebarCollapsed.value = collapsedStatus;
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background-color: #f8f9fa; /* Background abu muda untuk seluruh halaman */
}

/* WRAPPER KANAN */
.main-wrapper {
  margin-left: 260px; /* Lebar Sidebar Normal */
  width: calc(100% - 260px);
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease-in-out, width 0.3s ease-in-out;
}

/* SAAT SIDEBAR MENGECIL */
.main-wrapper.expanded {
  margin-left: 86px; /* Lebar Sidebar Kecil */
  width: calc(100% - 86px);
}

/* KONTEN UTAMA */
.content-body {
  padding: 30px; /* Jarak konten dari pinggir */
  flex: 1;
}
</style>
