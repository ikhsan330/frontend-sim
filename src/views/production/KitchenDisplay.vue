<template>
  <div class="kitchen-layout">

    <transition name="slide-fade">
      <div v-if="notification.show" :class="['alert-floating', 'alert-' + notification.type]">
        <div class="alert-content">
          <span class="alert-icon">{{ notification.type === 'success' ? '✅' : '⚠️' }}</span>
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
        <h1>👨‍🍳 Kitchen Display</h1>

        <div class="tab-group">
          <button
            @click="switchTab('pending')"
            :class="['tab-btn', { active: activeTab === 'pending' }]"
          >
            ⏳ Menunggu ({{ pendingCount }})
          </button>
          <button
            @click="switchTab('cooking')"
            :class="['tab-btn', { active: activeTab === 'cooking' }]"
          >
            🔥 Sedang Dimasak ({{ cookingCount }})
          </button>
        </div>
      </div>

      <div class="header-right">
        <div class="pagination-controls" v-if="totalPages > 1">
          <button @click="prevPage" :disabled="currentPage === 1" class="btn-page">◀</button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-page">▶</button>
        </div>

        <span class="clock">{{ currentTime }}</span>
        <button @click="fetchQueue" class="btn-refresh">🔄</button>
      </div>
    </header>

    <div class="kitchen-board">

      <transition name="tab-fade" mode="out-in">

        <div :key="activeTab" class="board-content">

          <div v-if="filteredOrders.length === 0" class="empty-state">
            <div class="icon">{{ activeTab === 'pending' ? '✅' : '👨‍🍳' }}</div>
            <h3>{{ activeTab === 'pending' ? 'Tidak Ada Pesanan Baru' : 'Tidak Ada yang Dimasak' }}</h3>
            <p>{{ activeTab === 'pending' ? 'Menunggu pesanan masuk...' : 'Semua masakan sudah selesai.' }}</p>
          </div>

          <div v-else class="order-grid-container">

            <transition name="page-slide" mode="out-in">

              <div :key="currentPage" class="grid-inner-wrapper">
                <div class="order-grid">
                  <div
                    v-for="order in paginatedOrders"
                    :key="order.id"
                    class="order-ticket"
                    :class="[
                      {'ticket-pending': order.status === 'pending'},
                      {'ticket-cooking': order.status === 'cooking'}
                    ]"
                  >
                    <div class="ticket-header">
                      <div class="ticket-info">
                        <span class="customer-name">{{ order.customer_name || 'Pelanggan Umum' }}</span>
                        <span class="invoice-id">#{{ order.invoice }}</span>
                      </div>
                      <div class="ticket-timer" :class="getTimerColor(order.created_at)">
                        ⏱️ {{ timeAgo(order.created_at) }}
                      </div>
                    </div>

                    <div class="ticket-body">
                      <ul>
                        <li v-for="(item, idx) in order.items" :key="idx" class="menu-item">
                          <div class="item-details">
                            <span class="item-qty">{{ item.qty }} Porsi</span>
                            <span class="item-name">{{ item.product_name }}</span>
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div class="ticket-footer">
                      <div v-if="activeTab === 'pending'">
                        <div class="status-badge pending">MENUNGGU</div>
                        <button class="btn-action btn-cook" @click="advanceStatus(order)">
                          🔥 Mulai Masak
                        </button>
                      </div>
                      <div v-else>
                        <div class="status-badge cooking">SEDANG DIMASAK</div>
                        <button class="btn-action btn-done" @click="advanceStatus(order)">
                          ✅ Selesai Masak
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>

          </div>

        </div>
      </transition>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import apiClient from '../../api/axios';

// --- STATE ---
const orders = ref([]);
const activeTab = ref('pending');
const currentPage = ref(1);
const itemsPerPage = 8;
const notification = ref({ show: false, type: 'success', message: '' });
const dialog = ref({ show: false, title: '', message: '', type: 'confirm', confirmText: 'Ya', resolve: null });
const currentTime = ref('');
let timer = null;
let clockTimer = null;

// --- 1. COMPUTED: FILTER & SORTING ---
const filteredOrders = computed(() => {
  let list = [];
  if (activeTab.value === 'pending') {
    list = orders.value.filter(o => o.status === 'pending');
  } else {
    list = orders.value.filter(o => o.status === 'cooking');
  }
  return list.sort((a, b) => new Date(a.created_at || new Date()) - new Date(b.created_at || new Date()));
});

// --- 2. COMPUTED: PAGINASI ---
const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage));

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredOrders.value.slice(start, end);
});

const pendingCount = computed(() => orders.value.filter(o => o.status === 'pending').length);
const cookingCount = computed(() => orders.value.filter(o => o.status === 'cooking').length);

// --- 3. NAVIGASI ---
const switchTab = (tab) => {
  activeTab.value = tab;
  currentPage.value = 1;
};

const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

// --- 4. FETCH DATA ---
const fetchQueue = async () => {
  try {
    const res = await apiClient.get('/production/queue-by-order');
    orders.value = res.data;
  } catch (err) { console.error("Gagal load antrian:", err); }
};

// --- 5. LOGIKA AKSI ---
const advanceStatus = async (order) => {
  let nextStatus = '';
  let confirmMsg = '';
  let confirmBtn = '';

  if (order.status === 'pending') {
    nextStatus = 'cooking';
  } else if (order.status === 'cooking') {
    nextStatus = 'completed';
    confirmMsg = `Pesanan meja ${order.customer_name} selesai dimasak?`;
    confirmBtn = 'Ya, Selesai';
  }

  if (nextStatus === 'completed') {
    const confirmed = await useDialog('Konfirmasi Selesai', confirmMsg, 'success', confirmBtn);
    if (!confirmed) return;
  }

  try {
    await apiClient.put(`/production/orders/${order.id}/status`, { status: nextStatus });
    if (nextStatus === 'cooking') triggerAlert('👨‍🍳 Pesanan DIMASAK', 'success');
    else triggerAlert('✅ Pesanan SELESAI', 'success');
    fetchQueue();
  } catch (err) { triggerAlert(err.response?.data?.message,"Gagal update status", 'danger'); }
};

// --- 6. HELPER ---
const triggerAlert = (message, type = 'success') => {
  notification.value = { show: true, type, message };
  setTimeout(() => { notification.value.show = false; }, 3000);
};

const useDialog = (title, message, type = 'danger', confirmText = 'Ya') => {
  return new Promise((resolve) => {
    dialog.value = { show: true, title, message, type, confirmText, resolve };
  });
};

const handleDialogConfirm = () => { dialog.value.show = false; if (dialog.value.resolve) dialog.value.resolve(true); };
const handleDialogCancel = () => { dialog.value.show = false; if (dialog.value.resolve) dialog.value.resolve(false); };

const timeAgo = (dateInput) => {
  if (!dateInput) return 'Baru Saja';
  const diffMins = Math.floor((new Date() - new Date(dateInput)) / 60000);
  if (diffMins < 1) return 'Baru Saja';
  if (diffMins < 60) return `${diffMins} mnt`;
  const diffHours = Math.floor(diffMins / 60);
  return `${diffHours} jam`;
};

const getTimerColor = (dateInput) => {
  if (!dateInput) return 'text-normal';
  const diffMins = Math.floor((new Date() - new Date(dateInput)) / 60000);
  if (diffMins > 20) return 'text-danger';
  if (diffMins > 10) return 'text-warning';
  return 'text-normal';
};

// --- LIFECYCLE ---
onMounted(() => {
  fetchQueue();
  timer = setInterval(fetchQueue, 5000);
  const updateClock = () => { currentTime.value = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); };
  updateClock();
  clockTimer = setInterval(updateClock, 1000);
});

onUnmounted(() => { clearInterval(timer); clearInterval(clockTimer); });
</script>

<style scoped>
/* LAYOUT GLOBAL */
.kitchen-layout { height: 100vh; background: #1e293b; color: #f8fafc; font-family: 'Segoe UI', sans-serif; display: flex; flex-direction: column; overflow: hidden; }

/* HEADER */
.kitchen-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 25px; background: #0f172a; border-bottom: 2px solid #334155;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3); flex-shrink: 0; height: 70px;
}
.brand { display: flex; align-items: center; gap: 20px; }
.brand h1 { margin: 0; font-size: 1.3rem; color: white; }

/* TAB & PAGINASI */
.tab-group { display: flex; gap: 8px; background: #334155; padding: 4px; border-radius: 8px; }
.tab-btn {
  background: transparent; border: none; color: #94a3b8; padding: 8px 16px;
  border-radius: 6px; font-weight: 700; cursor: pointer; transition: 0.2s; font-size: 0.9rem;
}
.tab-btn:hover { background: rgba(255,255,255,0.1); color: white; }
.tab-btn.active { background: #3b82f6; color: white; shadow: 0 2px 4px rgba(0,0,0,0.2); }

.header-right { display: flex; align-items: center; gap: 15px; }
.pagination-controls { display: flex; align-items: center; gap: 10px; background: #334155; padding: 4px 10px; border-radius: 6px; margin-right: 15px; }
.btn-page { background: #475569; border: none; color: white; border-radius: 4px; padding: 4px 10px; cursor: pointer; transition: 0.2s; }
.btn-page:hover:not(:disabled) { background: #64748b; }
.btn-page:disabled { opacity: 0.3; cursor: not-allowed; }
.page-info { font-weight: bold; font-size: 0.9rem; min-width: 40px; text-align: center; }

.clock { font-size: 1.2rem; font-weight: bold; font-family: monospace; color: #cbd5e1; }
.btn-refresh { padding: 8px; background: #334155; color: white; border: 1px solid #475569; border-radius: 6px; cursor: pointer; font-size: 1.2rem; }

/* BOARD AREA */
.kitchen-board {
  flex: 1; padding: 20px;
  overflow-y: auto; display: flex; flex-direction: column;
}
.board-content { width: 100%; height: 100%; display: flex; flex-direction: column; }

/* GRID & WRAPPER (PENTING UNTUK ANIMASI) */
.order-grid-container { flex: 1; overflow: hidden; }
.grid-inner-wrapper { height: 100%; }
.order-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  align-items: start;
}

/* TICKET CARD */
.order-ticket {
  background: white; border-radius: 8px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-top: 5px solid #94a3b8;
  transition: transform 0.2s;
  max-height: 400px;
}
.order-ticket:hover { transform: translateY(-3px); }
.ticket-pending { border-top-color: #f59e0b; }
.ticket-cooking { border-top-color: #3b82f6; background: #eff6ff; }

.ticket-header {
  padding: 10px 15px; border-bottom: 1px dashed #e2e8f0;
  display: flex; justify-content: space-between; align-items: center;
  background: #f8fafc; flex-shrink: 0;
}
.ticket-info { display: flex; flex-direction: column; }
.customer-name { font-weight: 800; font-size: 1rem; color: #1e293b; }
.invoice-id { font-size: 0.8rem; color: #64748b; font-family: monospace; }
.ticket-timer { font-size: 0.85rem; font-weight: 600; color: #64748b; }
.text-danger { color: #ef4444; animation: blink 1s infinite; }
.text-warning { color: #f59e0b; }

.ticket-body { padding: 10px 15px; flex: 1; overflow-y: auto; }
.ticket-body ul { list-style: none; padding: 0; margin: 0; }
.menu-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 0; border-bottom: 1px solid #f1f5f9;
}
.menu-item:last-child { border-bottom: none; }
.item-details { display: flex; gap: 8px; align-items: center; width: 100%; }
.item-qty {
  background: #e2e8f0; color: #1e293b;
  padding: 2px 6px; border-radius: 4px;
  font-weight: 800; font-size: 0.85rem;
  white-space: nowrap;
}
.item-name { font-weight: 600; color: #334155; font-size: 0.95rem; line-height: 1.2; }

.ticket-footer {
  padding: 10px 15px; background: #f8fafc; border-top: 1px solid #e2e8f0;
  display: flex; flex-direction: column; gap: 8px; flex-shrink: 0;
}
.status-badge {
  text-align: center; font-size: 0.7rem; font-weight: 800;
  padding: 3px; border-radius: 4px; letter-spacing: 1px;
}
.status-badge.pending { background: #fffbeb; color: #d97706; border: 1px solid #fcd34d; }
.status-badge.cooking { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }

.btn-action {
  width: 100%; padding: 10px; border: none; border-radius: 6px;
  font-weight: 800; cursor: pointer; text-transform: uppercase;
  font-size: 0.85rem; transition: 0.2s;
}
.btn-cook { background: #f59e0b; color: white; }
.btn-cook:hover { background: #d97706; }
.btn-done { background: #10b981; color: white; }
.btn-done:hover { background: #059669; }

.empty-state { text-align: center; margin-top: 80px; color: #94a3b8; }
.empty-state .icon { font-size: 4rem; margin-bottom: 15px; opacity: 0.5; }

/* ALERT & DIALOG */
.alert-floating {
  position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
  z-index: 99999; display: flex; align-items: center; gap: 15px;
  padding: 12px 25px; border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5); min-width: 320px;
  animation: slideDown 0.4s ease-out;
  color: #1e293b; font-weight: 600; background: white;
}
.alert-success { border-left: 5px solid #10b981; }
.alert-danger { border-left: 5px solid #ef4444; }
.alert-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; }

@keyframes slideDown { from { transform: translateX(-50%) translateY(-30px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }

.dialog-overlay { background: rgba(0,0,0,0.8); z-index: 10000; display: flex; justify-content: center; align-items: center; position: fixed; top: 0; left: 0; right: 0; bottom: 0; }
.dialog-content { background: #1e293b; color: #f8fafc; border: 1px solid #334155; padding: 25px; border-radius: 12px; width: 400px; text-align: left; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.btn-cancel { padding: 10px 20px; background: transparent; border: 1px solid #475569; color: #cbd5e1; border-radius: 6px; cursor: pointer; }
.btn-save { padding: 10px 20px; background: #10b981; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-danger { padding: 10px 20px; background: #ef4444; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; }

/* =========================================
   ANIMASI HALUS
   ========================================= */
/* Tab Switch */
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.3s ease; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; }

/* Pagination Slide */
.page-slide-enter-active, .page-slide-leave-active { transition: all 0.4s cubic-bezier(0.25, 0.8, 0.5, 1); }
.page-slide-enter-from { opacity: 0; transform: translateX(30px); }
.page-slide-leave-to { opacity: 0; transform: translateX(-30px); }
</style>
