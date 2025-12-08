<template>
  <div class="stock-layout">

    <header class="stock-header">
      <div class="brand">
        <h1>📦 Manajemen Stok</h1>
        <p class="subtitle">Kontrol bahan baku dapur & gudang</p>
      </div>

      <div class="header-actions">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            @keyup.enter="fetchStocks"
            placeholder="Cari bahan..."
          />
          <button @click="fetchStocks">🔍</button>
        </div>
        <button @click="fetchStocks" class="btn-refresh">🔄 Refresh</button>
      </div>
    </header>

    <div class="stock-content">

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div> Memuat data stok...
      </div>

      <div v-else class="table-container">
        <table class="stock-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Bahan</th>
              <th>Stok (Unit Dasar)</th>
              <th>Satuan Beli</th>
              <th>Avg Cost (HPP)</th>
              <th>Status</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in stocks" :key="item.id">
              <td>#{{ item.id }}</td>
              <td class="fw-bold">{{ item.name }}</td>
              <td>
                <span :class="getStockClass(item.stock)">
                  {{ formatNumber(item.stock) }} {{ item.unit }}
                </span>
              </td>
              <td class="text-gray">
                <span v-if="item.purchase_unit !== item.unit">
                  {{ item.purchase_unit }} (1={{ formatNumber(item.conversion_rate) }})
                </span>
                <span v-else>-</span>
              </td>
              <td>{{ formatRp(item.avg_cost) }}</td>
              <td>
                <span :class="['badge', getStatusColor(item.stock)]">
                  {{ getStatusText(item.stock) }}
                </span>
              </td>
              <td class="text-right">
                <button @click="openRestock(item)" class="btn-action btn-blue">
                  📥 Restock
                </button>
                <button @click="openOpname(item)" class="btn-action btn-gray">
                  ⚖️ Opname
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="stocks.length === 0" class="empty-state">
          <p>Data tidak ditemukan.</p>
        </div>
      </div>
    </div>

    <div v-if="showRestockModal" class="modal-overlay">
      <div class="modal-content">
        <h3>📥 Barang Masuk: {{ selectedItem.name }}</h3>
        <p class="modal-subtitle">Pilih satuan pembelian agar stok otomatis terkonversi.</p>

        <form @submit.prevent="submitRestock">

          <div class="form-group">
            <label>Beli dalam Satuan apa?</label>
            <div class="toggle-unit">
              <label class="radio-label">
                <input type="radio" v-model="restockForm.use_purchase_unit" :value="true">
                <span class="custom-radio"></span>
                <span class="radio-text">{{ selectedItem.purchase_unit }} (Beli)</span>
              </label>

              <label class="radio-label">
                <input type="radio" v-model="restockForm.use_purchase_unit" :value="false">
                <span class="custom-radio"></span>
                <span class="radio-text">{{ selectedItem.unit }} (Dasar)</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Jumlah Dibeli</label>
            <div class="input-wrapper">
              <input
                v-model.number="restockForm.qty"
                type="number" step="0.01" placeholder="0" required
                class="input-dark has-badge"
              />
              <span class="unit-badge">
                {{ restockForm.use_purchase_unit ? selectedItem.purchase_unit : selectedItem.unit }}
              </span>
            </div>

            <div class="info-box mt-2" v-if="restockForm.use_purchase_unit && selectedItem.conversion_rate > 1">
              ℹ️ Sistem akan menambah stok: <br>
              <strong class="text-green">
                {{ formatNumber(restockForm.qty * selectedItem.conversion_rate) }} {{ selectedItem.unit }}
              </strong>
            </div>
          </div>

          <div class="form-group">
            <label>Total Rupiah Belanja</label>
            <input
              v-model.number="restockForm.total_cost"
              type="number" placeholder="Rp 0" required
              class="input-dark"
            />
            <small class="hint" v-if="restockForm.qty > 0 && restockForm.total_cost > 0">
              HPP Baru: {{ formatRp(calculateHPP()) }} / {{ selectedItem.unit }}
            </small>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-save">Simpan Stok</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showOpnameModal" class="modal-overlay">
      <div class="modal-content">
        <h3>⚖️ Stock Opname: {{ selectedItem.name }}</h3>
        <p class="modal-subtitle">Koreksi stok manual (Rusak, Hilang, atau Selisih).</p>

        <form @submit.prevent="submitOpname">
          <div class="info-box mb-3">
            Stok Sistem: <strong>{{ formatNumber(selectedItem.stock) }} {{ selectedItem.unit }}</strong>
          </div>

          <div class="form-group">
            <label>Selisih / Perubahan (+/-)</label>
            <div class="input-wrapper">
              <input
                v-model.number="opnameForm.qty_change"
                type="number"
                step="0.01"
                placeholder="-2 atau 5"
                required
                class="input-dark has-badge"
              />
              <span class="unit-badge">{{ selectedItem.unit }}</span>
            </div>
            <small class="hint-danger">Gunakan tanda minus (-) untuk mengurangi.</small>
          </div>

          <div class="form-group">
            <label>Alasan</label>
            <select v-model="opnameForm.reason" class="input-dark" required>
              <option value="adjustment">Penyesuaian Hitungan</option>
              <option value="waste">Barang Busuk/Rusak (Waste)</option>
              <option value="admin_error">Salah Input Admin</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-danger">Sesuaikan</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../../api/axios';

const stocks = ref([]);
const searchQuery = ref('');
const isLoading = ref(false);

// MODAL STATE
const showRestockModal = ref(false);
const showOpnameModal = ref(false);
const selectedItem = ref({});

// FORM STATE
const restockForm = ref({ qty: '', total_cost: '', use_purchase_unit: true });
const opnameForm = ref({ qty_change: '', reason: 'adjustment' });

// --- FETCH DATA ---
const fetchStocks = async () => {
  isLoading.value = true;
  try {
    const res = await apiClient.get(`/production/stocks?q=${searchQuery.value}`);

    // [PERBAIKAN]
    // Karena backend mengirim format { data: [...], count: ... }
    // Maka kita harus ambil res.data.data
    stocks.value = res.data.data || [];

  } catch (err) {
    console.error(err);
    if(err.response && err.response.status === 403) {
      alert("Akses Ditolak: Akun Anda tidak memiliki izin dapur.");
    }
  } finally {
    isLoading.value = false;
  }
};

// --- LOGIC RESTOCK (UPDATED) ---
const openRestock = (item) => {
  selectedItem.value = item;
  // Default pilih satuan beli (misal: Karung) jika ada rasio > 1
  const hasConversion = item.conversion_rate && item.conversion_rate > 1;

  restockForm.value = {
    qty: '',
    total_cost: '',
    use_purchase_unit: hasConversion
  };
  showRestockModal.value = true;
};

// Hitung HPP Real-time (Untuk Preview)
const calculateHPP = () => {
  const qtyInput = restockForm.value.qty;
  const cost = restockForm.value.total_cost;
  if(!qtyInput || !cost) return 0;

  let finalQty = qtyInput;
  // Jika pakai satuan beli, kalikan rasio
  if (restockForm.value.use_purchase_unit) {
    finalQty = qtyInput * selectedItem.value.conversion_rate;
  }
  return cost / finalQty;
};

const submitRestock = async () => {
  try {
    let finalQty = restockForm.value.qty;

    // KONVERSI OTOMATIS: Karung -> Gram
    if (restockForm.value.use_purchase_unit) {
      finalQty = finalQty * selectedItem.value.conversion_rate;
    }

    // Hitung harga per unit dasar (HPP)
    const pricePerUnit = restockForm.value.total_cost / finalQty;

    // Kirim ke endpoint produksi
    await apiClient.post('/production/restock', {
      ingredient_id: selectedItem.value.id,
      qty: finalQty, // Kirim yang sudah dikonversi (Gram)
      price: pricePerUnit
    });

    alert(`Berhasil! Stok bertambah ${formatNumber(finalQty)} ${selectedItem.value.unit}`);
    closeModal();
    fetchStocks();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal restock');
  }
};

// --- LOGIC OPNAME ---
const openOpname = (item) => {
  selectedItem.value = item;
  opnameForm.value = { qty_change: '', reason: 'adjustment' };
  showOpnameModal.value = true;
};

const submitOpname = async () => {
  try {
    await apiClient.post('/production/adjustment', {
      ingredient_id: selectedItem.value.id,
      qty_change: opnameForm.value.qty_change,
      reason: opnameForm.value.reason
    });

    alert('Stok berhasil disesuaikan!');
    closeModal();
    fetchStocks();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal opname');
  }
};

const closeModal = () => {
  showRestockModal.value = false;
  showOpnameModal.value = false;
};

// HELPER
const formatRp = (val) => {
  if (!val || isNaN(val)) return 'Rp 0';
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(val);
};

const formatNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return new Intl.NumberFormat('id-ID').format(val);
};

const getStockClass = (val) => {
  if (!val || val <= 0) return 'text-red';
  if (val < 10) return 'text-orange';
  return 'text-green';
};

const getStatusText = (val) => (!val || val <= 0) ? 'HABIS' : (val < 10 ? 'MENIPIS' : 'AMAN');
const getStatusColor = (val) => (!val || val <= 0) ? 'bg-red' : (val < 10 ? 'bg-orange' : 'bg-green');

onMounted(fetchStocks);
</script>

<style scoped>
/* DARK THEME STYLING */
.stock-layout {
  min-height: 100vh;
  background-color: #1e293b;
  color: #f8fafc;
  font-family: 'Segoe UI', sans-serif;
}

/* Header */
.stock-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 30px; background-color: #0f172a; border-bottom: 1px solid #334155;
}
.brand h1 { margin: 0; font-size: 1.5rem; }
.subtitle { color: #94a3b8; font-size: 0.9rem; margin: 0; }

.header-actions { display: flex; gap: 10px; }
.search-bar { display: flex; background: #334155; border-radius: 6px; overflow: hidden; }
.search-bar input { background: transparent; border: none; padding: 8px 12px; color: white; outline: none; }
.search-bar button { background: transparent; border: none; cursor: pointer; padding: 0 10px; }

.btn-refresh { padding: 8px 15px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-refresh:hover { background: #2563eb; }

/* Content */
.stock-content { padding: 30px; }
.loading-state { text-align: center; color: #94a3b8; margin-top: 50px; }
.spinner { display: inline-block; width: 20px; height: 20px; border: 3px solid rgba(255,255,255,.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite; margin-right: 10px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Table */
.table-container { background: #0f172a; border-radius: 12px; overflow: hidden; border: 1px solid #334155; }
.stock-table { width: 100%; border-collapse: collapse; }
.stock-table th { background: #1e293b; padding: 15px; text-align: left; color: #94a3b8; font-size: 0.9rem; border-bottom: 1px solid #334155; }
.stock-table td { padding: 15px; border-bottom: 1px solid #334155; color: #e2e8f0; vertical-align: middle; }

.text-right { text-align: right; }
.text-gray { color: #94a3b8; font-size: 0.85rem; }
.text-green { color: #10b981; }
.text-orange { color: #f59e0b; }
.text-red { color: #ef4444; }
.fw-bold { font-weight: 700; }

.badge { padding: 4px 10px; border-radius: 50px; font-size: 0.75rem; font-weight: bold; }
.bg-green { background: rgba(16, 185, 129, 0.2); color: #10b981; }
.bg-orange { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.bg-red { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

/* Buttons */
.btn-action { padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; margin-left: 5px; color: white; transition: 0.2s; }
.btn-blue { background: #3b82f6; } .btn-blue:hover { background: #2563eb; }
.btn-gray { background: #475569; } .btn-gray:hover { background: #64748b; }

/* MODALS */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 100; backdrop-filter: blur(3px); }
.modal-content { background: #1e293b; padding: 30px; border-radius: 12px; width: 420px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); color: white; }
.modal-content h3 { margin-top: 0; color: #f8fafc; }
.modal-subtitle { color: #94a3b8; font-size: 0.9rem; margin-bottom: 20px; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 8px; font-size: 0.9rem; color: #cbd5e1; }
.input-dark { width: 100%; padding: 12px; background: #0f172a; border: 1px solid #334155; color: white; border-radius: 8px; outline: none; box-sizing: border-box; }
.input-dark:focus { border-color: #3b82f6; }

.info-box { background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155; font-size: 0.9rem; }
.mt-2 { margin-top: 10px; }
.mb-3 { margin-bottom: 15px; }
.hint { font-size: 0.8rem; color: #10b981; margin-top: 5px; display: block; }
.hint-danger { font-size: 0.8rem; color: #f59e0b; margin-top: 5px; display: block; }

/* Toggle Unit Style */
.toggle-unit { display: flex; gap: 15px; background: #0f172a; padding: 10px; border-radius: 8px; border: 1px solid #334155; }
.radio-label { display: flex; align-items: center; cursor: pointer; color: #cbd5e1; font-size: 0.9rem; flex: 1; }
.radio-label input { margin-right: 8px; width: 16px; height: 16px; accent-color: #3b82f6; }

.input-wrapper { position: relative; display: flex; align-items: center; }
.input-dark.has-badge { padding-right: 60px; }
.unit-badge { position: absolute; right: 12px; color: #94a3b8; font-size: 0.85rem; font-weight: bold; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; pointer-events: none; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; }
.btn-cancel { padding: 10px 20px; background: transparent; border: 1px solid #475569; color: #cbd5e1; border-radius: 6px; cursor: pointer; }
.btn-save { padding: 10px 20px; background: #10b981; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-danger { padding: 10px 20px; background: #ef4444; border: none; color: white; border-radius: 6px; cursor: pointer; font-weight: bold; }
</style>
