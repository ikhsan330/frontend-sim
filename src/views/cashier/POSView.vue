<template>
  <div class="pos-layout">

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

        <input
          v-if="dialog.type === 'prompt'"
          v-model="dialog.inputValue"
          class="input-lg"
          placeholder="Ketik disini..."
          autofocus
          @keyup.enter="handleDialogConfirm"
        />

        <div class="modal-actions">
  <button
    v-if="dialog.type !== 'success'"
    @click="handleDialogCancel"
    class="btn-cancel"
  >
    Batal
  </button>

  <button @click="handleDialogConfirm" class="btn-primary">
    {{ dialog.confirmText || 'Ya, Lanjutkan' }}
  </button>
</div>
      </div>
    </div>
    <div class="product-section">
      <div class="fixed-product-header">
        <div class="filter-bar">
          <input v-model="searchQuery" placeholder="🔍 Cari menu..." class="search-input" />
          <select v-model="selectedCategory" class="cat-select">
            <option value="">Semua Kategori</option>
            <option value="Food">Makanan</option>
            <option value="Drink">Minuman</option>
            <option value="Snack">Snack</option>
          </select>
        </div>
      </div>

      <div class="product-scroll-area">
        <div class="product-grid">
          <div v-for="product in filteredProducts" :key="product.id" class="product-card" @click="addToCart(product)">
            <div class="card-info">
              <div class="prod-name">{{ product.name }}</div>
              <div class="prod-price">{{ formatRp(product.price) }}</div>
            </div>
            <button class="btn-add-mini">+</button>
          </div>
          <div v-if="filteredProducts.length === 0" class="empty-state">
            Menu tidak ditemukan
          </div>
        </div>
      </div>
    </div>

    <div class="cart-section">
      <div class="shift-header" v-if="sessionInfo">
        <div class="shift-item">
          <span class="lbl">Modal Awal</span>
          <span class="val">{{ formatRp(sessionInfo.start_cash) }}</span>
        </div>
        <div class="shift-item">
          <span class="lbl">Omset Hari Ini</span>
          <span class="val green">{{ formatRp(sessionInfo.total_sales) }}</span>
        </div>
      </div>

      <div class="cart-tabs">
        <button :class="['tab-btn', { active: activeTab === 'cart' }]" @click="activeTab = 'cart'">🛒 Keranjang</button>
        <button :class="['tab-btn', { active: activeTab === 'bill' }]" @click="fetchPendingOrders">📄 Tagihan</button>
        <button :class="['tab-btn', { active: activeTab === 'history' }]" @click="fetchHistory">📜 Riwayat</button>
      </div>

      <div v-if="activeTab === 'cart'" class="tab-content">
        <div class="cart-items-scroll">
          <div v-if="cart.length === 0" class="empty-cart">
            <div class="icon">🛒</div>
            <p>Belum ada pesanan</p>
          </div>
          <div v-for="(item, index) in cart" :key="index" class="cart-item">
            <div class="item-left">
              <strong>{{ item.name }}</strong>
              <div class="item-price">Harga: {{ formatRp(item.price) }}</div>
            </div>
            <div class="item-right">
              <div class="qty-control">
                <button @click="decreaseQty(index)">-</button>
                <span>{{ item.qty }}</span>
                <button @click="increaseQty(index)">+</button>
              </div>
              <div class="item-total">{{ formatRp(item.price * item.qty) }}</div>
            </div>
          </div>
        </div>

        <div class="fixed-cart-footer">
          <div class="total-row">
            <span>Total:</span>
            <span class="total-amount">{{ formatRp(grandTotal) }}</span>
          </div>
          <div class="action-grid">
            <button class="btn-kitchen" :disabled="cart.length === 0" @click="sendToKitchen">
              👨‍🍳 Dapur
            </button>
            <button class="btn-checkout" :disabled="cart.length === 0" @click="openCheckoutModal('direct')">
              💰 Bayar
            </button>
          </div>
          <button @click="openCloseShiftModal" class="btn-text-danger">
            Tutup Shift
          </button>
        </div>
      </div>

      <div v-else-if="activeTab === 'bill'" class="tab-content">
        <div class="cart-items-scroll">
          <div v-if="pendingOrders.length === 0" class="empty-cart">
            <p>Tidak ada tagihan pending.</p>
          </div>
          <div v-for="order in pendingOrders" :key="order.invoice" class="bill-card">
            <div class="bill-info">
              <strong style="font-size: 1.1rem; color: #2c3e50;">
                {{ order.customer || 'Pelanggan Umum' }}
              </strong>
              <small style="color: #7f8c8d; margin-top: 4px; display: block;">
                #{{ order.invoice }} • {{ order.time }}
              </small>
              <div style="font-weight: bold; color: #e67e22; margin-top: 5px;">
                Rp {{ formatNumber(order.total) }}
              </div>
            </div>
            <button @click="payBill(order)" class="btn-pay-bill">Bayar</button>
          </div>
        </div>
      </div>

      <div v-else class="tab-content">
        <div class="cart-items-scroll">
          <div v-if="historyOrders.length === 0" class="empty-cart">
            <p>Belum ada transaksi.</p>
          </div>
          <div v-for="order in historyOrders" :key="order.invoice" class="bill-card" :class="{ 'void-card': order.status === 'cancelled' }">
            <div class="bill-info">
              <strong style="font-size: 1rem;">
                {{ order.customer || 'Pelanggan Umum' }}
              </strong>
              <small style="display: block; margin-top: 2px;">
                #{{ order.invoice }} • {{ order.time }}
              </small>
              <div class="status-badge" v-if="order.status === 'cancelled'">DIBATALKAN</div>
            </div>
            <div class="bill-action-right">
              <span class="bill-total">{{ formatRp(order.total) }}</span>
              <div class="history-actions">
                <button
                  v-if="order.status !== 'cancelled'"
                  @click="refundOrder(order.invoice)"
                  class="btn-refund"
                  title="Batalkan (Refund)"
                >
                  ↩️
                </button>
                <button
                  @click="deleteOrder(order.invoice)"
                  class="btn-delete"
                  title="Hapus History"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div v-if="showCheckoutModal" class="modal-overlay">
      <div class="modal-content">
        <h2>💳 Pembayaran</h2>
        <div class="checkout-summary">Total: <strong>{{ formatRp(currentTotal) }}</strong></div>

        <div class="form-group">
          <label>Nama Pelanggan</label>
          <input v-model="customerName" type="text" class="input-lg" placeholder="Pelanggan Umum" />
        </div>

        <div class="form-group">
          <label>Metode Pembayaran</label>
          <select v-model="paymentMethod" class="input-lg">
            <option value="cash">Tunai (Cash)</option>
            <option value="qris">QRIS</option>
            <option value="transfer">Transfer Bank</option>
          </select>
        </div>

        <div class="form-group" v-if="paymentMethod === 'cash'">
           <label>Uang Diterima</label>
           <input v-model="cashReceived" type="number" class="input-lg" placeholder="Rp..." />
           <p v-if="cashReceived > 0" class="text-change">Kembalian: {{ formatRp(cashReceived - currentTotal) }}</p>
        </div>

        <div class="modal-actions">
          <button @click="showCheckoutModal = false" class="btn-cancel">Batal</button>
          <button @click="processTransaction" class="btn-primary" :disabled="isProcessing">
            {{ isProcessing ? 'Memproses...' : 'Bayar & Cetak' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showReceiptModal" class="modal-overlay">
      <div class="modal-content receipt-modal">
        <div id="printable-area" class="receipt-paper">
          <div class="receipt-header">
            <h3>UMKM KULINER</h3>
            <p>Jl. Bathin Alam No. 1</p>
            <p>{{ lastTransaction?.date }}</p>
          </div>
          <hr class="dashed">
          <div class="receipt-meta">
            <p>Inv: {{ lastTransaction?.invoice }}</p>
            <p>Pelanggan: {{ lastTransaction?.customer }}</p>
            <p>Kasir: {{ authStore.user?.username }}</p>
          </div>
          <hr class="dashed">
          <div class="receipt-total">
            <h1>TOTAL: {{ formatRp(lastTransaction?.total) }}</h1>
            <p v-if="paymentMethod === 'cash' && cashReceived">Bayar: {{ formatRp(cashReceived) }}</p>
            <p v-if="paymentMethod === 'cash' && cashReceived">Kembali: {{ formatRp(cashReceived - lastTransaction?.total) }}</p>
            <p>Metode: {{ paymentMethod.toUpperCase() }}</p>
          </div>
          <hr class="dashed">
          <div class="receipt-footer">
            <p>Terima Kasih!</p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="printReceipt" class="btn-secondary">🖨️ Cetak</button>
          <button @click="closeReceipt" class="btn-primary">Tutup</button>
        </div>
      </div>
    </div>

    <div v-if="showOpenShiftModal" class="modal-overlay">
      <div class="modal-content">
        <h2 style="margin-bottom: 10px;">☀️ Selamat Pagi!</h2>
        <form @submit.prevent="submitOpenShift">
          <input v-model="startCashInput" type="number" placeholder="Rp 0" class="input-shift" required autofocus />
          <button type="submit" class="btn-shift-open">Buka Shift Sekarang</button>
        </form>
      </div>
    </div>

    <div v-if="showCloseShiftModal" class="modal-overlay">
      <div class="modal-content">
        <h2>🌙 Tutup Shift</h2>
        <form @submit.prevent="submitCloseShift">
          <label>Uang Fisik Aktual</label>
          <input v-model="endCashActual" type="number" required class="input-lg" />
          <div class="modal-actions">
            <button type="button" @click="showCloseShiftModal = false" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-danger">Tutup shift</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../../api/axios';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

// === STATE ALERT & DIALOG ===
const notification = ref({ show: false, type: 'success', message: '' });
const dialog = ref({ show: false, title: '', message: '', type: 'confirm', inputValue: '', resolve: null, confirmText: '' });

// Helper untuk memunculkan notifikasi melayang
const triggerAlert = (message, type = 'success') => {
  notification.value = { show: true, type, message };
  setTimeout(() => { notification.value.show = false; }, 3000);
};

// Helper untuk DIALOG (Pengganti confirm & prompt)
const useDialog = (title, message, type = 'confirm', confirmText = 'Ya') => {
  return new Promise((resolve) => {
    dialog.value = {
      show: true,
      title,
      message,
      type,
      inputValue: '',
      confirmText,
      resolve
    };
  });
};

const handleDialogConfirm = () => {
  dialog.value.show = false;
  if (dialog.value.resolve) {
    // Jika prompt, kembalikan teks input. Jika confirm, kembalikan true.
    dialog.value.resolve(dialog.value.type === 'prompt' ? (dialog.value.inputValue || 'Pelanggan Umum') : true);
  }
};

const handleDialogCancel = () => {
  dialog.value.show = false;
  if (dialog.value.resolve) dialog.value.resolve(false);
};
// =============================

// DATA STATE
const products = ref([]);
const cart = ref([]);
const pendingOrders = ref([]);
const historyOrders = ref([]);
const activeTab = ref('cart');
const searchQuery = ref('');
const selectedCategory = ref('');
const sessionInfo = ref(null);

// MODAL STATE
const showCheckoutModal = ref(false);
const showReceiptModal = ref(false);
const showOpenShiftModal = ref(false);
const showCloseShiftModal = ref(false);
const isProcessing = ref(false);

// FORM STATE
const paymentMethod = ref('cash');
const customerName = ref('');
const cashReceived = ref('');
const currentTotal = ref(0);
const currentInvoice = ref(null);
const lastTransaction = ref(null);
const startCashInput = ref('');
const endCashActual = ref('');

// --- INIT ---
onMounted(async () => {
  await checkShiftStatus();
  await loadMenu();
});

const checkShiftStatus = async () => {
  try {
    const res = await apiClient.get('/sales/dashboard');
    sessionInfo.value = res.data.session_info;
    if (res.data.status === 'Shift Belum Dibuka') showOpenShiftModal.value = true;
  } catch (err) { console.error(err); }
};

const loadMenu = async () => {
  const res = await apiClient.get('/sales/menu');
  products.value = res.data.menu;
};

// --- DATA FETCHING ---
const fetchPendingOrders = async () => {
  activeTab.value = 'bill';
  const res = await apiClient.get('/sales/orders/pending');
  pendingOrders.value = res.data;
};

const fetchHistory = async () => {
  activeTab.value = 'history';
  const res = await apiClient.get('/sales/orders/history');
  historyOrders.value = res.data;
};

// --- CART LOGIC ---
const addToCart = (p) => {
  const item = cart.value.find(i => i.id === p.id);
  item ? item.qty++ : cart.value.push({ ...p, qty: 1 });
};
const increaseQty = (i) => cart.value[i].qty++;
const decreaseQty = (i) => cart.value[i].qty > 1 ? cart.value[i].qty-- : cart.value.splice(i, 1);
const clearCart = () => cart.value = [];
const grandTotal = computed(() => cart.value.reduce((sum, i) => sum + (i.price * i.qty), 0));
const filteredProducts = computed(() => products.value.filter(p => p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) && (selectedCategory.value ? p.category === selectedCategory.value : true)));

// --- TRANSACTION LOGIC ---
const sendToKitchen = async () => {
  // GANTI CONFIRM & PROMPT BAWAAN
  const confirmed = await useDialog('Kirim ke Dapur', 'Pesanan ini akan dibuatkan tagihan (Pending). Lanjutkan?', 'confirm', 'Kirim');
  if (!confirmed) return;

  const name = await useDialog('Nama Pelanggan', 'Masukkan nama untuk pesanan ini:', 'prompt', 'Simpan');

  try {
    await apiClient.post('/sales/orders', {
      items: cart.value.map(i => ({ product_id: i.id, qty: i.qty })),
      payment_method: 'pending',
      customer_name: name
    });

    triggerAlert('Pesanan dikirim ke dapur!', 'success');
    clearCart();
  } catch (err) {
    triggerAlert(err.response?.data?.message || 'Gagal kirim', 'danger');
  }
};

const openCheckoutModal = (type) => {
  paymentMethod.value = 'cash';
  cashReceived.value = '';
  customerName.value = '';
  if (type === 'direct') {
    currentInvoice.value = null;
    currentTotal.value = grandTotal.value;
  }
  showCheckoutModal.value = true;
};

const payBill = (order) => {
  currentInvoice.value = order.invoice;
  currentTotal.value = order.total;
  showCheckoutModal.value = true;
};

const processTransaction = async () => {
  isProcessing.value = true;
  try {
    let res;
    if (currentInvoice.value) {
      res = await apiClient.post(`/sales/orders/${currentInvoice.value}/pay`, { payment_method: paymentMethod.value });
    } else {
      res = await apiClient.post('/sales/orders', {
        items: cart.value.map(i => ({ product_id: i.id, qty: i.qty })),
        payment_method: paymentMethod.value,
        customer_name: customerName.value || 'Pelanggan Umum'
      });
    }

    lastTransaction.value = {
      invoice: res.data.invoice,
      total: currentTotal.value,
      date: res.data.date,
      customer: res.data.customer || customerName.value || 'Pelanggan Umum'
    };

    showCheckoutModal.value = false;
    showReceiptModal.value = true;
    cart.value = [];

    checkShiftStatus();
    if (activeTab.value === 'bill') fetchPendingOrders();
    triggerAlert('Transaksi Berhasil!', 'success');

  } catch (err) {
    triggerAlert(err.response?.data?.message || 'Transaksi Gagal', 'danger');
  } finally { isProcessing.value = false; }
};

// --- REFUND & SHIFT ---
const refundOrder = async (invoice) => {
  const confirmed = await useDialog('Batalkan Transaksi?', `Yakin ingin membatalkan ${invoice}? Stok akan dikembalikan.`, 'confirm', 'Ya, Batalkan');
  if (!confirmed) return;

  try {
    await apiClient.post(`/sales/orders/${invoice}/void`);
    triggerAlert('Transaksi dibatalkan (Refund).', 'warning');
    fetchHistory();
    checkShiftStatus();
  } catch (err) { triggerAlert(err.response?.data?.message, 'danger'); }
};

const deleteOrder = async (invoice) => {
  const confirmed = await useDialog('Hapus Riwayat?', `Data ${invoice} akan hilang selamanya dan tidak masuk laporan.`, 'confirm', 'Hapus Permanen');
  if (!confirmed) return;

  try {
    await apiClient.delete(`/sales/orders/${invoice}`);
    triggerAlert('Riwayat berhasil dihapus.', 'success');
    fetchHistory();
    checkShiftStatus();
  } catch (err) {
    triggerAlert(err.response?.data?.message || "Gagal menghapus.", 'danger');
  }
};

const submitOpenShift = async () => {
  try {
    await apiClient.post('/sales/shift/open', { start_cash: startCashInput.value });
    showOpenShiftModal.value = false;
    checkShiftStatus();
    triggerAlert('Shift Dibuka!', 'success');
  } catch (err) { triggerAlert(err.response?.data?.message ||'Gagal buka shift', 'danger'); }
};

const openCloseShiftModal = () => showCloseShiftModal.value = true;
const formatRp = (val) => {
  const num = Number(val);
  // Jika bukan angka (null/undefined/NaN), kembalikan Rp 0
  if (isNaN(num)) return 'Rp 0';
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(num);
};

const formatNumber = (val) => {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
};
const submitCloseShift = async () => {
  // 1. Validasi Input Sederhana
  if (endCashActual.value === '' || endCashActual.value === null) {
    triggerAlert('Mohon masukkan jumlah uang fisik di laci!', 'warning');
    return;
  }

  // 2. Sembunyikan Modal Input Dulu (Supaya Dialog Konfirmasi terlihat jelas)
  showCloseShiftModal.value = false;

  // 3. Konfirmasi Aksi (Custom Dialog)
  const confirmed = await useDialog(
    'Konfirmasi Tutup Shift',
    'Anda akan logout dan laporan shift akan dibuat. Apakah perhitungan uang fisik sudah final?',
    'danger',
    'Ya, Tutup Shift'
  );

  // Jika user klik Batal di dialog konfirmasi
  if (!confirmed) {
    showCloseShiftModal.value = true; // Munculkan lagi modal input
    return;
  }

  try {
    // 4. Kirim Data ke Backend
    const res = await apiClient.post('/sales/shift/close', {
      end_cash_actual: endCashActual.value
    });

    const summary = res.data.summary;
    const selisih = summary.selisih;

    // 5. Tentukan Status Laporan
    let statusEmoji = '';
    let dialogType = 'success'; // Default hijau

    if (selisih === 0) {
        statusEmoji = '✅ BALANCE (Sesuai)';
    } else if (selisih < 0) {
        statusEmoji = `❌ KURANG: ${formatRp(selisih)}`;
        dialogType = 'danger'; // Merah jika kurang
    } else {
        statusEmoji = `⚠️ LEBIH: ${formatRp(selisih)}`;
        dialogType = 'warning'; // Kuning jika lebih
    }

    // 6. Tampilkan Ringkasan Akhir (Info Dialog)
    await useDialog(
      'Laporan Shift Ditutup',
      `
        Status: ${statusEmoji}
        Sistem: ${formatRp(summary.end_cash_system)}
        Fisik: ${formatRp(summary.end_cash_actual)}
      `,
      dialogType,
      'OK, Tutup'
    );

    // 7. Logout & Redirect
    if (authStore.logout) await authStore.logout(); // Bersihkan state di Pinia
    localStorage.clear(); // Hapus token di storage
    router.push('/login'); // Tendang ke halaman login

  } catch (err) {
    // Jika error API, buka lagi modalnya
    showCloseShiftModal.value = true;
    triggerAlert(err.response?.data?.message || 'Gagal tutup shift', 'danger');
  }
};

const closeReceipt = () => showReceiptModal.value = false;
const printReceipt = () => window.print();
</script>

<style scoped>
/* =========================================
   STYLE ALERT (NOTIFIKASI POJOK ATAS)
   ========================================= */
.alert-floating {
  position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
  z-index: 99999;
  display: flex; align-items: center; justify-content: space-between; gap: 15px;
  padding: 12px 25px; border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2); min-width: 320px;
  animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.alert-content { display: flex; align-items: center; gap: 10px; }
.alert-icon { font-size: 1.2rem; }
.alert-msg { font-weight: 600; font-size: 0.95rem; }
.alert-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; opacity: 0.7; }
.alert-success { background-color: #d1fae5; color: #065f46; border: 2px solid #10b981; }
.alert-danger { background-color: #fee2e2; color: #991b1b; border: 2px solid #ef4444; }
.alert-warning { background-color: #fef3c7; color: #92400e; border: 2px solid #f59e0b; }

@keyframes slideDown {
  from { transform: translateX(-50%) translateY(-30px); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}

/* =========================================
   STYLE DIALOG CUSTOM (PENGGANTI CONFIRM)
   ========================================= */
.dialog-overlay { background: rgba(0,0,0,0.7); z-index: 10000; } /* Lebih tinggi dari modal biasa */
.dialog-content { width: 350px; text-align: left; padding: 25px; }
.dialog-content h3 { margin-top: 0; color: #2c3e50; }
.dialog-content p { color: #555; margin: 10px 0 20px; line-height: 1.5; }

/* =========================================
   STYLE POS ASLI & PRINT FIX
   ========================================= */
.pos-layout { display: flex; width: 100vw; height: 100vh; background: #f1f5f9; overflow: hidden; font-family: 'Segoe UI', sans-serif; }

/* ... (Style Layout, Card, dll SAMA SEPERTI SEBELUMNYA) ... */
.product-section { flex: 2; display: flex; flex-direction: column; border-right: 1px solid #ddd; height: 100%; }
.fixed-product-header { padding: 15px; background: #f1f5f9; z-index: 10; flex-shrink: 0; }
.filter-bar { display: flex; gap: 10px; }
.search-input { padding: 10px; border-radius: 8px; border: 1px solid #ccc; flex: 1; }
.cat-select { padding: 10px; border-radius: 8px; border: 1px solid #ccc; width: 140px; flex: none; cursor: pointer; }
.product-scroll-area { flex: 1; overflow-y: auto; padding: 15px; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 15px; }
.product-card { background: white; border-radius: 10px; cursor: pointer; border: 1px solid #eee; transition: 0.2s; padding-bottom: 10px; overflow: hidden; }
.product-card:hover { border-color: #10b981; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
.card-info { padding: 10px; }
.prod-name { font-weight: bold; font-size: 0.9rem; margin-bottom: 5px; }
.prod-price { color: #10b981; font-weight: bold; }
.btn-add-mini { float: right; margin-right: 10px; background: #10b981; color: white; border: none; width: 25px; height: 25px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }

.cart-section { flex: 1.2; display: flex; flex-direction: column; background: white; height: 100%; min-width: 350px; }
.shift-header { padding: 12px 15px; background: #2c3e50; color: white; display: flex; justify-content: space-between; font-size: 0.9rem; flex-shrink: 0; }
.shift-item { display: flex; flex-direction: column; }
.shift-item .lbl { font-size: 0.75rem; opacity: 0.8; }
.shift-item .val { font-weight: bold; }
.shift-item .val.green { color: #2ecc71; }
.cart-tabs { display: flex; border-bottom: 1px solid #eee; background: #f8fafc; flex-shrink: 0; }
.tab-btn { flex: 1; padding: 12px; background: transparent; border: none; cursor: pointer; font-weight: 600; color: #64748b; border-bottom: 3px solid transparent; }
.tab-btn.active { background: white; color: #10b981; border-bottom-color: #10b981; }
.tab-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; height: 100%; }
.cart-items-scroll { flex: 1; overflow-y: auto; padding: 15px; background-color: #fff; }
.cart-items-scroll::-webkit-scrollbar { width: 5px; }
.cart-items-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
.fixed-cart-footer { flex-shrink: 0; padding: 15px; background: white; border-top: 1px solid #e2e8f0; box-shadow: 0 -4px 15px rgba(0,0,0,0.05); z-index: 20; padding-bottom: 90px; }
.empty-cart { text-align: center; margin-top: 50px; color: #cbd5e1; font-size: 1.2rem; }
.cart-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #eee; align-items: center; }
.qty-control { display: flex; gap: 5px; align-items: center; }
.qty-control button { width: 25px; height: 25px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.bill-card { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px; }
.bill-total { font-weight: bold; color: #2c3e50; font-size: 1rem; display: block; margin-bottom: 5px; }
.status-badge { font-size: 0.7rem; background: #ef4444; color: white; padding: 2px 5px; border-radius: 4px; }
.void-card { background: #fee2e2; border-color: #fca5a5; opacity: 0.7; }
.btn-pay-bill { background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; }
.btn-refund { background: #f39c12; color: white; border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer; font-size: 0.9rem; }
.btn-delete { background: #e74c3c; color: white; border: none; padding: 6px 10px; border-radius: 5px; cursor: pointer; font-size: 0.9rem; }
.btn-delete:hover { background: #c0392b; }
.history-actions { display: flex; gap: 5px; justify-content: flex-end; margin-top: 5px; }
.total-row { display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 800; margin-bottom: 15px; color: #2c3e50; }
.total-amount { color: #10b981; }
.action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.btn-kitchen { background: #f39c12; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; }
.btn-checkout { background: #10b981; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; }
.btn-text-danger { background: #fee2e2; border: 1px solid #ef4444; color: #ef4444; width: 100%; cursor: pointer; padding: 8px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; text-align: center; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(2px); }
.modal-content { background: white; padding: 25px; border-radius: 12px; width: 400px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.input-lg { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; font-size: 1rem; }
.modal-actions { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }
.btn-primary { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.btn-secondary { background: #64748b; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
.btn-cancel { background: #ddd; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; }
.input-shift { width: 100%; padding: 15px; font-size: 1.5rem; font-weight: bold; text-align: center; border: 2px solid #ddd; border-radius: 8px; margin: 20px 0; color: #2c3e50; }
.input-shift:focus { border-color: #10b981; outline: none; }
.btn-shift-open { width: 100%; padding: 15px; background: #10b981; color: white; font-size: 1.1rem; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
.receipt-paper { border: 1px solid #ddd; padding: 20px; background: #fff; font-family: 'Courier New', Courier, monospace; text-align: center; margin-bottom: 20px; max-height: 400px; overflow-y: auto; }
.dashed { border-top: 1px dashed #000; margin: 10px 0; }

/* === CSS PRINT FINAL (MENGHILANGKAN KOTAK) === */
@media print {
  /* 1. Reset Halaman & Sembunyikan Semua */
  @page { margin: 0; size: auto; }
  body, html { background-color: white; height: 100%; margin: 0; padding: 0; overflow: hidden; }
  body * { visibility: hidden; }

  /* 2. Matikan Styling Modal Pembungkus (Ini Kuncinya) */
  .modal-content {
    box-shadow: none !important;
    border: none !important;
    background: transparent !important;
    padding: 0 !important; margin: 0 !important;
    width: 100% !important; position: static !important;
  }

  /* 3. Tampilkan HANYA Area Struk */
  #printable-area, #printable-area * { visibility: visible; }

  /* 4. Paksa Struk ke Pojok Atas */
  #printable-area {
    position: fixed; left: 0; top: 0; width: 100%;
    margin: 0; padding: 10px; background-color: white;
    z-index: 99999;
  }

  /* 5. Hilangkan Elemen Sampah */
  .modal-actions, .modal-overlay, .alert-floating, button, .receipt-footer { display: none !important; }
  hr { border-color: #000; }
}
</style>
