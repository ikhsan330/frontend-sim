<template>
  <div class="kitchen-layout">

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
          <button @click="handleDialogConfirm" :class="dialog.type === 'danger' ? 'btn-danger' : 'btn-save'">
            {{ dialog.confirmText }}
          </button>
        </div>
      </div>
    </div>
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
import apiClient from '../../api/axios';



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
    // Tidak perlu alert error di sini agar tidak mengganggu auto-refresh
  }
};

// LOGIKA KLIK TOMBOL
const advanceStatus = async (order) => {
  let nextStatus = '';

  if (order.status === 'pending') {
    nextStatus = 'cooking'; // Masak
  } else if (order.status === 'cooking') {
    // GANTI CONFIRM BAWAAN
    const confirmed = await useDialog(
      'Pesanan Selesai?',
      `Selesaikan pesanan untuk ${order.customer}?`,
      'danger',
      'Selesai Masak'
    );

    if (!confirmed) return;
    nextStatus = 'completed'; // Selesai
  }

  try {
    await apiClient.put(`/production/orders/${order.id}/status`, {
      status: nextStatus
    });

    // Alert Sukses
    if (nextStatus === 'cooking') triggerAlert(`Mulai memasak untuk ${order.customer}`, 'warning');
    else triggerAlert(`Pesanan ${order.customer} selesai!`, 'success');

    fetchQueue();
  } catch (err) {
    triggerAlert("Gagal update status: " + err.message, 'danger');
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
/* =========================================
   STYLE ALERT & DIALOG (DARK THEME)
   ========================================= */
.alert-floating {
  position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
  z-index: 99999;
  display: flex; align-items: center; gap: 15px;
  padding: 12px 25px; border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5); min-width: 320px;
  animation: slideDown 0.4s ease-out;
  color: #1e293b;
  font-weight: 600;
}
.alert-content { flex: 1; display: flex; align-items: center; gap: 10px; }
.alert-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; opacity: 0.6; color: inherit; }
.alert-success { background-color: #d1fae5; border: 2px solid #10b981; color: #065f46; }
.alert-danger { background-color: #fee2e2; border: 2px solid #ef4444; color: #991b1b; }
.alert-warning { background-color: #fef3c7; border: 2px solid #f59e0b; color: #92400e; }

@keyframes slideDown {
  from { transform: translateX(-50%) translateY(-30px); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}

/* DIALOG (DARK) */
.dialog-overlay { z-index: 10000; }
.dialog-content {
  background: #1e293b !important; /* Dark BG */
  color: #f8fafc;
  border: 1px solid #334155 !important;
  text-align: left !important;
  width: 380px !important;
}
.dialog-content h3 { margin-top: 0; color: #f8fafc; margin-bottom: 10px; }
.dialog-content p { color: #cbd5e1; margin-bottom: 20px; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
.btn-cancel { padding: 10px 20px; background: transparent; border: 1px solid #475569; color: #cbd5e1; border-radius: 6px; cursor: pointer; }
.btn-save { padding: 10px 20px; background: #10b981; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-danger { padding: 10px 20px; background: #ef4444; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; }

/* MODAL OVERLAY (GLOBAL) */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; backdrop-filter: blur(3px); }
.modal-content { background: #1e293b; padding: 30px; border-radius: 12px; width: 420px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }

/* =========================================
   STYLE DAPUR ASLI
   ========================================= */
.kitchen-layout { min-height: 100vh; background-color: #1e293b; color: #f8fafc; font-family: 'Segoe UI', sans-serif; }

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

.qty-badge { background: #f97316; color: white; padding: 5px 12px; border-radius: 8px; text-align: center; }
.qty-num { display: block; font-size: 1.4rem; font-weight: 800; line-height: 1; }
.qty-label { font-size: 0.7rem; text-transform: uppercase; font-weight: 600; }

.card-body { padding: 15px; flex: 1; }
.tags { display: flex; flex-direction: column; gap: 8px; }

.tag-btn {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
  cursor: pointer; transition: 0.2s; width: 100%; text-align: left;
}
.status-icon { font-size: 1.5rem; }
.btn-text { display: flex; flex-direction: column; }
.cust-name { font-weight: 800; font-size: 1rem; color: #1e293b; }
.inv-no { font-size: 0.75rem; color: #64748b; font-family: monospace; }

.tag-btn.pending { background: #f8fafc; border-color: #cbd5e1; }
.tag-btn.pending:hover { background: #fffbeb; border-color: #f59e0b; }

.tag-btn.cooking {
  background: #eff6ff; border-color: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
  animation: pulse-border 2s infinite;
}
.tag-btn.cooking .cust-name { color: #2563eb; }

@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
@keyframes pulse-border { 0% { border-color: #3b82f6; } 50% { border-color: #93c5fd; } 100% { border-color: #3b82f6; } }
</style>
