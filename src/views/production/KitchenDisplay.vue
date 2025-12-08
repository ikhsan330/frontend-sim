<template>
  <div class="kitchen-layout">

    <header class="kitchen-header">
      <div class="brand">
        <h1>👨‍🍳 Kitchen Queue</h1>
        <div class="live-indicator">
          <span class="dot-pulse"></span>
          <span>Live Update ({{ date }})</span>
        </div>
      </div>
      <div class="actions">
        <button @click="fetchQueue" class="btn-refresh">🔄 Refresh</button>
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>
    </header>

    <div class="kitchen-board">

      <div v-if="Object.keys(tasks).length === 0" class="empty-state">
        <div class="icon">✅</div>
        <h3>Dapur Bersih!</h3>
        <p>Tidak ada pesanan aktif saat ini.</p>
      </div>

      <div v-else class="task-grid">
        <div v-for="(detail, menuName) in tasks" :key="menuName" class="task-card">

          <div class="card-header">
            <h3 class="menu-title">{{ menuName }}</h3>
            <div class="qty-badge">
              <span class="qty-num">{{ detail.total_qty }}</span>
              <span class="qty-label">Porsi</span>
            </div>
          </div>

          <div class="card-body">
            <div class="tags">
              <button
                v-for="order in detail.orders"
                :key="order.id"
                class="tag-btn"
                :class="order.status"
                @click="advanceStatus(order)"
                :title="order.status === 'pending' ? 'Klik untuk Masak' : 'Klik untuk Selesai'"
              >
                <div class="status-icon">
                  {{ order.status === 'pending' ? '🕒' : '🔥' }}
                </div>

                <div class="btn-text">
                  <span class="cust-name">{{ order.customer || 'Pelanggan' }}</span>
                  <span class="inv-no">#{{ order.invoice }}</span>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';
import apiClient from '../../api/axios';

const authStore = useAuthStore();
const router = useRouter();

const tasks = ref({});
const date = ref('');
let timer = null;

// FETCH DATA
const fetchQueue = async () => {
  try {
    const res = await apiClient.get('/production/queue');
    tasks.value = res.data.tasks;
    date.value = res.data.date;
  } catch (err) {
    console.error("Gagal load antrian:", err);
  }
};

// LOGIKA KLIK TOMBOL
const advanceStatus = async (order) => {
  let nextStatus = '';

  if (order.status === 'pending') {
    nextStatus = 'cooking'; // Masak
  } else if (order.status === 'cooking') {
    if(!confirm(`Selesaikan pesanan ${order.customer}?`)) return;
    nextStatus = 'completed'; // Selesai
  }

  try {
    // Panggil API Update Status
    await apiClient.put(`/production/orders/${order.id}/status`, {
        status: nextStatus
    });

    // Refresh otomatis
    fetchQueue();
  } catch (err) {
    alert("Gagal update status: " + err.message);
  }
};

const handleLogout = async () => {
  if (confirm('Keluar dari dapur?')) {
    await authStore.logout();
    router.push('/login');
  }
};

// AUTO REFRESH (5 Detik)
onMounted(() => {
  fetchQueue();
  timer = setInterval(fetchQueue, 5000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
/* TEMA GELAP */
.kitchen-layout { min-height: 100vh; background-color: #1e293b; color: #f8fafc; font-family: 'Segoe UI', sans-serif; }

/* HEADER */
.kitchen-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 30px; background-color: #0f172a; border-bottom: 1px solid #334155;
  position: sticky; top: 0; z-index: 50;
}
.brand h1 { margin: 0; font-size: 1.5rem; color: #f8fafc; }
.live-indicator { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: #10b981; margin-top: 5px; }
.dot-pulse { width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; animation: pulse 1.5s infinite; }

.actions { display: flex; gap: 10px; }
.btn-refresh { padding: 8px 15px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-logout { padding: 8px 15px; background: #334155; color: #cbd5e1; border: 1px solid #475569; border-radius: 6px; cursor: pointer; }

/* CONTENT */
.kitchen-board { padding: 30px; }
.empty-state { text-align: center; margin-top: 100px; color: #64748b; }
.empty-state .icon { font-size: 4rem; margin-bottom: 20px; }

/* GRID */
.task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

/* CARD */
.task-card {
  background: white; color: #1e293b; border-radius: 12px; overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3); border-left: 6px solid #f97316;
  display: flex; flex-direction: column;
}
.card-header {
  background: #fff7ed; padding: 15px; border-bottom: 1px dashed #fdba74;
  display: flex; justify-content: space-between; align-items: center;
}
.menu-title { margin: 0; font-size: 1.2rem; color: #c2410c; font-weight: 800; }

.qty-badge {
  background: #f97316; color: white; padding: 5px 12px; border-radius: 8px; text-align: center;
}
.qty-num { display: block; font-size: 1.4rem; font-weight: 800; line-height: 1; }
.qty-label { font-size: 0.7rem; text-transform: uppercase; font-weight: 600; }

.card-body { padding: 15px; flex: 1; }
.tags { display: flex; flex-direction: column; gap: 8px; }

/* TOMBOL INTERAKTIF (MODIFIKASI UTAMA) */
.tag-btn {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
  cursor: pointer; transition: 0.2s; width: 100%; text-align: left;
}

.status-icon {
  font-size: 1.5rem;
}

.btn-text {
  display: flex;
  flex-direction: column;
}

.cust-name {
  font-weight: 800;
  font-size: 1rem;
  color: #1e293b;
}

.inv-no {
  font-size: 0.75rem;
  color: #64748b;
  font-family: monospace;
}

/* Warna Status Pending */
.tag-btn.pending {
  background: #f8fafc; border-color: #cbd5e1;
}
.tag-btn.pending:hover {
  background: #fffbeb; border-color: #f59e0b;
}

/* Warna Status Cooking */
.tag-btn.cooking {
  background: #eff6ff; border-color: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
  animation: pulse-border 2s infinite;
}
.tag-btn.cooking .cust-name {
  color: #2563eb;
}

@keyframes pulse {
  0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; }
}
@keyframes pulse-border {
  0% { border-color: #3b82f6; } 50% { border-color: #93c5fd; } 100% { border-color: #3b82f6; }
}
</style>
