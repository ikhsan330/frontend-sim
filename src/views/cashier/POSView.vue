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
          <button v-if="dialog.type !== 'success'" @click="handleDialogCancel" class="btn-cancel">
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
          <span class="lbl">Omset Tunai</span>
          <span class="val green">{{ formatRp(sessionInfo.total_sales) }}</span>
        </div>
        <div class="shift-item highlight-item">
          <span class="lbl">Total Dilaci</span>
          <span class="val">{{ formatRp(Number(sessionInfo.start_cash) + Number(sessionInfo.total_sales)) }}</span>
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

          <div class="action-grid-single">
            <button class="btn-kitchen" :disabled="cart.length === 0" @click="sendToKitchen">
              👨‍🍳 Kirim ke Dapur
            </button>
            <button @click="openCloseShiftModal" class="btn-text-danger">
            Tutup Shift
          </button>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'bill'" class="tab-content">
        <div class="cart-items-scroll">
          <div v-if="pendingOrders.length === 0" class="empty-cart">
            <p>Tidak ada tagihan pending.</p>
          </div>
          <div v-for="order in pendingOrders" :key="order.invoice" class="bill-card">
            <div class="bill-info">
              <strong class="cust-name">{{ order.customer || 'Pelanggan Umum' }}</strong>
              <small class="inv-info">#{{ order.invoice }} • {{ order.time }}</small>
              <div class="bill-amount">Total: {{ formatRp(order.total) }}</div>
            </div>
            <div class="bill-action-right">
              <button @click="payBill(order)" class="btn-pay-bill">💰 Bayar</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="tab-content">
        <div class="cart-items-scroll">
          <div v-if="historyOrders.length === 0" class="empty-cart">
            <p>Belum ada transaksi selesai.</p>
          </div>
          <div v-for="order in historyOrders" :key="order.invoice" class="bill-card" :class="{ 'void-card': order.status === 'cancelled' }">
            <div class="bill-info">
              <strong class="cust-name">{{ order.customer || 'Pelanggan Umum' }}</strong>
              <small class="inv-info">#{{ order.invoice }} • {{ order.time }}</small>
              <div v-if="order.status === 'cancelled'" class="status-badge">DIBATALKAN</div>
            </div>

            <div class="bill-action-right">
              <span class="bill-total">{{ formatRp(order.total) }}</span>
              <div class="history-actions">
                <button
                  v-if="order.status !== 'cancelled'"
                  @click="refundOrder(order.invoice)"
                  class="btn-refund"
                  title="Batalkan (Refund)"
                >↩️</button>
                <button
                  @click="deleteOrder(order.invoice)"
                  class="btn-delete"
                  title="Hapus History"
                >🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div v-if="showCheckoutModal" class="modal-overlay">
      <div class="modal-content">
        <h2>💳 Pembayaran Tagihan</h2>
        <div class="checkout-summary">Total: <strong>{{ formatRp(currentTotal) }}</strong></div>

        <div class="form-group">
          <label>Nama Pelanggan</label>
          <input v-model="customerName" type="text" class="input-lg" disabled />
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
           <input v-model="cashReceived" type="number" class="input-lg" placeholder="Rp..." autofocus />
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
            <p>Plg: {{ lastTransaction?.customer }}</p>
            <p>Ksr: {{ authStore.user?.username }}</p>
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
          <label>Uang Fisik Aktual di Laci</label>
          <input v-model="endCashActual" type="number" required class="input-lg" placeholder="Hitung uang fisik..." />
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

// === STATE ===
const notification = ref({ show: false, type: 'success', message: '' });
const dialog = ref({ show: false, title: '', message: '', type: 'confirm', inputValue: '', resolve: null, confirmText: '' });

// Helper Alert
const triggerAlert = (message, type = 'success') => {
  notification.value = { show: true, type, message };
  setTimeout(() => { notification.value.show = false; }, 3000);
};

// Helper Dialog
const useDialog = (title, message, type = 'confirm', confirmText = 'Ya') => {
  return new Promise((resolve) => {
    dialog.value = { show: true, title, message, type, inputValue: '', confirmText, resolve };
  });
};

const handleDialogConfirm = () => {
  dialog.value.show = false;
  if (dialog.value.resolve) {
    dialog.value.resolve(dialog.value.type === 'prompt' ? (dialog.value.inputValue || 'Pelanggan Umum') : true);
  }
};

const handleDialogCancel = () => {
  dialog.value.show = false;
  if (dialog.value.resolve) dialog.value.resolve(false);
};

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

// --- FETCH DATA ---
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
  const confirmed = await useDialog('Kirim ke Dapur', 'Pesanan ini akan masuk ke tab Tagihan (Pending).', 'confirm', 'Kirim');
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
    // Opsional: pindah ke tab bill untuk melihat pesanan
    // fetchPendingOrders();
  } catch (err) {
    triggerAlert(err.response?.data?.message || 'Gagal kirim', 'danger');
  }
};

const payBill = (order) => {
  currentInvoice.value = order.invoice;
  currentTotal.value = order.total;
  customerName.value = order.customer || 'Pelanggan Umum';
  paymentMethod.value = 'cash';
  cashReceived.value = '';
  showCheckoutModal.value = true;
};

const processTransaction = async () => {
  isProcessing.value = true;
  try {
    // Proses Pembayaran Tagihan Pending
    const res = await apiClient.post(`/sales/orders/${currentInvoice.value}/pay`, { payment_method: paymentMethod.value });

    lastTransaction.value = {
      invoice: res.data.invoice,
      total: currentTotal.value,
      date: res.data.date,
      customer: customerName.value
    };

    showCheckoutModal.value = false;
    showReceiptModal.value = true;

    // Refresh Data
    checkShiftStatus(); // Update omset
    fetchPendingOrders(); // Refresh list tagihan (item yg dibayar akan hilang dari sini)

    // Auto print opsi (bisa diaktifkan)
    // setTimeout(printReceipt, 1000);

    triggerAlert('Pembayaran Berhasil!', 'success');

  } catch (err) {
    triggerAlert(err.response?.data?.message || 'Transaksi Gagal', 'danger');
  } finally { isProcessing.value = false; }
};

// --- REFUND & SHIFT ---
const refundOrder = async (invoice) => {
  const confirmed = await useDialog('Batalkan Transaksi?', `Stok akan dikembalikan. Lanjutkan?`, 'confirm', 'Ya, Refund');
  if (!confirmed) return;

  try {
    await apiClient.post(`/sales/orders/${invoice}/void`);
    triggerAlert('Transaksi dibatalkan.', 'warning');
    fetchHistory();
    checkShiftStatus();
  } catch (err) { triggerAlert(err.response?.data?.message, 'danger'); }
};

const deleteOrder = async (invoice) => {
  const confirmed = await useDialog('Hapus History?', `Data akan hilang permanen dari laporan.`, 'confirm', 'Hapus');
  if (!confirmed) return;

  try {
    await apiClient.delete(`/sales/orders/${invoice}`);
    triggerAlert('Riwayat dihapus.', 'success');
    fetchHistory();
    checkShiftStatus();
  } catch (err) { triggerAlert(err.response?.data?.message,'Gagal hapus', 'danger'); }
};

const submitOpenShift = async () => {
  try {
    await apiClient.post('/sales/shift/open', { start_cash: startCashInput.value });
    showOpenShiftModal.value = false;
    checkShiftStatus();
    triggerAlert('Shift Dibuka!', 'success');
  } catch (err) { triggerAlert(err.response?.data?.message,'Gagal buka shift', 'danger'); }
};

const openCloseShiftModal = () => showCloseShiftModal.value = true;

const submitCloseShift = async () => {
  if (!endCashActual.value) return triggerAlert('Isi uang fisik!', 'warning');
  showCloseShiftModal.value = false;

  const confirmed = await useDialog('Tutup Shift?', 'Pastikan uang fisik sudah dihitung.', 'danger', 'Tutup Shift');
  if (!confirmed) { showCloseShiftModal.value = true; return; }

  try {
    const res = await apiClient.post('/sales/shift/close', { end_cash_actual: endCashActual.value });
    const summary = res.data.summary;

    // Tampilkan Ringkasan
    let msg = `Sistem: ${formatRp(summary.end_cash_system)}\nFisik: ${formatRp(summary.end_cash_actual)}\n`;
    msg += summary.selisih === 0 ? '✅ BALANCE' : (summary.selisih < 0 ? `❌ KURANG: ${formatRp(summary.selisih)}` : `⚠️ LEBIH: ${formatRp(summary.selisih)}`);

    await useDialog('Laporan Shift', msg, summary.selisih < 0 ? 'danger' : 'success', 'OK');

    if (authStore.logout) await authStore.logout();
    localStorage.clear();
    router.push('/login');
  } catch (err) {
    showCloseShiftModal.value = true;
    triggerAlert(err.response?.data?.message,'Gagal tutup shift', 'danger');
  }
};

// UTILS
const formatRp = (val) => {
  const num = Number(val);
  if (isNaN(num)) return 'Rp 0';
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(num);
};

const closeReceipt = () => showReceiptModal.value = false;

// FUNGSI PRINT A4 (IFRAME)
const printReceipt = () => {
  const content = document.getElementById('printable-area').innerHTML;
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute'; iframe.style.width = '0px'; iframe.style.height = '0px'; iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <html>
      <head>
        <title>Struk A4</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Courier New', monospace; font-size: 14pt; width: 100%; margin: 0; }
          .receipt-header, .receipt-footer, .receipt-total h1 { text-align: center; }
          .dashed { border-top: 2px dashed #000; margin: 15px 0; }
          .receipt-meta p, .receipt-total p { display: flex; justify-content: space-between; margin: 5px 0; }
          .receipt-total { text-align: right; margin-top: 20px; }
          strong { font-weight: bold; }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `);
  doc.close();
  iframe.contentWindow.focus();
  setTimeout(() => iframe.contentWindow.print(), 500);
  setTimeout(() => document.body.removeChild(iframe), 2000);
};
</script>

<style scoped>
/* LAYOUT UTAMA */
.pos-layout { display: flex; width: 100vw; height: 100vh; background: #f1f5f9; overflow: hidden; font-family: 'Segoe UI', sans-serif; }

/* KIRI: PRODUK */
.product-section { flex: 2; display: flex; flex-direction: column; border-right: 1px solid #e2e8f0; height: 100%; }
.fixed-product-header { padding: 15px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
.filter-bar { display: flex; gap: 10px; }
.search-input { padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; flex: 1; }
.cat-select { padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; cursor: pointer; }

.product-scroll-area { flex: 1; overflow-y: auto; padding: 20px; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; }
.product-card {
  background: white; border-radius: 12px; cursor: pointer; border: 1px solid #e2e8f0;
  transition: 0.2s; padding: 15px; display: flex; flex-direction: column; justify-content: space-between; height: 120px;
}
.product-card:hover { border-color: #10b981; transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.prod-name { font-weight: 700; font-size: 1rem; color: #1e293b; margin-bottom: 5px; line-height: 1.3; }
.prod-price { color: #10b981; font-weight: 600; }
.btn-add-mini {
  align-self: flex-end; background: #10b981; color: white; border: none; width: 30px; height: 30px;
  border-radius: 50%; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
}

/* KANAN: KERANJANG */
.cart-section { flex: 1.3; display: flex; flex-direction: column; background: white; height: 100%; min-width: 400px; box-shadow: -5px 0 15px rgba(0,0,0,0.03); }

/* SHIFT INFO HEADER */
.shift-header {
  padding: 15px; background: #1e293b; color: white; display: flex; gap: 15px; align-items: center; justify-content: space-between;
}
.shift-item { display: flex; flex-direction: column; }
.shift-item .lbl { font-size: 0.75rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px; }
.shift-item .val { font-weight: 700; font-size: 1rem; }
.shift-item .val.green { color: #4ade80; }
.highlight-item { background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 6px; }

/* TABS */
.cart-tabs { display: flex; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
.tab-btn {
  flex: 1; padding: 15px; background: transparent; border: none; cursor: pointer;
  font-weight: 600; color: #64748b; border-bottom: 3px solid transparent; transition: 0.2s;
}
.tab-btn:hover { background: #f1f5f9; }
.tab-btn.active { background: white; color: #10b981; border-bottom-color: #10b981; }

/* SCROLL AREA & ITEMS */
.tab-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
/* PENTING: Padding bottom besar agar item terakhir tidak tertutup footer */
.cart-items-scroll { flex: 1; overflow-y: auto; padding: 15px; padding-bottom: 140px; }

.cart-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e2e8f0; align-items: center; }
.qty-control { display: flex; gap: 8px; align-items: center; background: #f1f5f9; padding: 4px; border-radius: 6px; }
.qty-control button { width: 28px; height: 28px; border: 1px solid #cbd5e1; background: white; border-radius: 4px; cursor: pointer; font-weight: bold; }

/* BILL & HISTORY CARDS (PERBAIKAN TAMPILAN) */
.bill-card {
  display: flex; justify-content: space-between; align-items: flex-start; /* Align top */
  padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 10px;
}
.bill-info { flex: 1; margin-right: 10px; }
.cust-name { font-size: 1.05rem; color: #1e293b; display: block; }
.inv-info { color: #64748b; font-size: 0.85rem; display: block; margin: 4px 0 8px; }
.bill-amount { font-weight: 700; color: #f59e0b; font-size: 1.1rem; }

/* Agar tombol kanan tidak gepeng */
.bill-action-right {
  display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0;
}
.btn-pay-bill { background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-pay-bill:hover { background: #059669; }

.history-actions { display: flex; gap: 5px; }
.btn-refund, .btn-delete { width: 35px; height: 35px; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
.btn-refund { background: #f59e0b; color: white; }
.btn-delete { background: #ef4444; color: white; }

/* FOOTER CART */
.fixed-cart-footer {
  position: absolute; bottom: 0; left: 0; width: 100%;
  padding: 20px; background: white; border-top: 1px solid #e2e8f0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05); z-index: 10;
}
.total-row { display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: 800; margin-bottom: 15px; color: #1e293b; }
.total-amount { color: #10b981; }

.action-grid-single { display: flex; gap: 10px; margin-bottom: 50px; }
.btn-kitchen {
  width: 100%; background: #3b82f6; color: white; border: none; padding: 14px;
  border-radius: 8px; font-weight: 700; font-size: 1rem; cursor: pointer; display: flex; justify-content: center; gap: 10px;
}
.btn-kitchen:disabled { background: #cbd5e1; cursor: not-allowed; }
.btn-kitchen:hover:not(:disabled) { background: #2563eb; }

.btn-text-danger {
   width: 100%; background: #ef4444; color: white; border: none; padding: 14px;
  border-radius: 8px; font-weight: 700; font-size: 1rem; cursor: pointer; display: flex; justify-content: center; gap: 10px;
}
.btn-text-danger:hover:not(:disabled) { background: #ed6a6a; }
.btn-text-danger:disabled { background: #cbd5e1; cursor: not-allowed; }
/* MODAL & ALERT (Sama seperti sebelumnya) */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.modal-content { background: white; padding: 25px; border-radius: 12px; width: 420px; text-align: center; }
.input-lg { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; margin: 10px 0; font-size: 1rem; }
.modal-actions { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }
.btn-primary { background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn-cancel { background: #e2e8f0; color: #475569; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; }

/* ALERT FLOATING */
.alert-floating { position: fixed; top: 30px; left: 50%; transform: translateX(-50%); z-index: 10000; display: flex; gap: 15px; padding: 12px 25px; border-radius: 50px; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.2); font-weight: 600; }
.alert-success { border-left: 5px solid #10b981; color: #065f46; }
.alert-danger { border-left: 5px solid #ef4444; color: #991b1b; }
.alert-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; }
</style>
