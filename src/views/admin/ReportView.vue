<template>
  <div class="report-container">
    <div class="header">
      <h1>📈 Laporan Keuangan</h1>

      <div class="date-filter">
        <input v-model="filters.startDate" type="date" />
        <span class="splitter">s/d</span>
        <input v-model="filters.endDate" type="date" />
        <button @click="loadData" class="btn-filter">Tampilkan</button>
      </div>
    </div>

    <div class="summary-cards">
      <div class="card net-profit">
        <h3>Laba Bersih (Net Profit)</h3>
        <div class="value">{{ formatRp(profitLoss['5. LABA BERSIH (Net Profit)'] || 0) }}</div>
        <small>Keuntungan Bersih Usaha</small>
      </div>

      <div class="card revenue">
        <h3>Total Omset</h3>
        <div class="value">{{ formatRp(profitLoss['1. Pendapatan (Omzet)'] || 0) }}</div>
        <small>Uang Masuk Valid</small>
      </div>

      <div class="card cogs">
        <h3>Total HPP</h3>
        <div class="value text-danger">{{ formatRp(profitLoss['2. Beban Pokok Penjualan (HPP Bahan)'] || 0) }}</div>
        <small>Modal Bahan Baku Terpakai</small>
      </div>

      <div class="card asset">
        <h3>Nilai Aset Gudang</h3>
        <div class="value text-blue">{{ formatRp(stockAssetValue) }}</div>
        <small>Stok Fisik Tersisa</small>
      </div>
    </div>

    <div class="content-grid">
      <div class="chart-section card-box">
        <h3>📊 Tren Penjualan Harian</h3>
        <div class="chart-wrapper" v-if="chartData.labels && chartData.labels.length > 0">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
        <div v-else class="no-data">
          <p>Belum ada data penjualan valid pada periode ini.</p>
        </div>
      </div>

      <div class="expense-section card-box">
        <h3>💸 Input Biaya Operasional</h3>
        <p>Catat pengeluaran seperti Listrik, Gaji, Sewa, dll.</p>

        <form @submit.prevent="submitExpense">
          <div class="form-group">
            <label>Nama Biaya</label>
            <input v-model="expenseForm.name" placeholder="Contoh: Token Listrik" required />
          </div>
          <div class="form-group">
            <label>Jumlah (Rp)</label>
            <input v-model="expenseForm.amount" type="number" placeholder="Contoh: 100000" required />
          </div>
          <div class="form-group">
            <label>Tanggal</label>
            <input v-model="expenseForm.date" type="date" required />
          </div>
          <button type="submit" class="btn-save">Simpan Biaya</button>
        </form>

        <div class="expense-info">
          <small>Total Biaya Operasional Periode Ini:</small>
          <strong>{{ formatRp(profitLoss['4. Beban Operasional'] || 0) }}</strong>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../../api/axios';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Bar } from 'vue-chartjs';

// Registrasi Komponen Chart
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// STATE
const filters = ref({
  startDate: new Date().toISOString().slice(0, 10), // Hari ini
  endDate: new Date().toISOString().slice(0, 10)
});

const profitLoss = ref({});
const stockAssetValue = ref(0);
const expenseForm = ref({ name: '', amount: '', date: new Date().toISOString().slice(0, 10) });

// Chart Config
const chartData = ref({ labels: [], datasets: [] });
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } }
};

// --- 1. FETCH DATA ---
const loadData = async () => {
  const params = `?start_date=${filters.value.startDate}&end_date=${filters.value.endDate}`;

  try {
    // A. Ambil Laba Rugi
    const resPL = await apiClient.get(`/admin/reports/profit-loss${params}`);
    profitLoss.value = resPL.data.details;

    // B. Ambil Nilai Aset Gudang
    const resStock = await apiClient.get('/admin/reports/stock');
    stockAssetValue.value = resStock.data.total_asset_value;

    // C. Ambil Data Grafik Penjualan
    const resSales = await apiClient.get(`/admin/reports/sales${params}`);
    setupChart(resSales.data.daily_data);

  } catch (err) {
    console.error("Gagal load laporan", err);
  }
};

// --- 2. SETUP CHART ---
const setupChart = (dailyData) => {
  const labels = dailyData.map(item => item.date);
  const data = dailyData.map(item => item.revenue);

  chartData.value = {
    labels: labels,
    datasets: [
      {
        label: 'Omset',
        backgroundColor: '#42b983',
        borderRadius: 4,
        data: data
      }
    ]
  };
};

// --- 3. INPUT BIAYA ---
const submitExpense = async () => {
  try {
    await apiClient.post('/admin/expenses', expenseForm.value);
    alert('Biaya berhasil disimpan!');
    expenseForm.value.name = '';
    expenseForm.value.amount = '';
    loadData(); // Refresh laporan laba rugi
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal simpan biaya');
  }
};

// Helper
const formatRp = (val) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val);

// Fungsi Helper untuk format YYYY-MM-DD sesuai Jam Lokal Laptop
const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

onMounted(() => {
  const today = new Date();
  const startDate = new Date();

  // Mundurkan 2 bulan
  startDate.setMonth(today.getMonth() - 2);

  // Gunakan fungsi lokal, jangan toISOString()
  filters.value.endDate = getLocalDateString(today);
  filters.value.startDate = getLocalDateString(startDate);

  loadData();
});
</script>

<style scoped>
.report-container { padding: 0; font-family: 'Segoe UI', sans-serif; color: #2c3e50; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 10px; }
.header h1 { margin: 0; font-size: 1.8rem; }

.date-filter { display: flex; gap: 10px; align-items: center; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.date-filter input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; }
.btn-filter { background: #2c3e50; color: white; padding: 8px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-filter:hover { background: #34495e; }

/* SUMMARY CARDS */
.summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
.card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); text-align: center; transition: transform 0.2s; }
.card:hover { transform: translateY(-5px); }
.card h3 { margin: 0 0 10px; font-size: 0.85rem; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; }
.card .value { font-size: 1.8rem; font-weight: 800; color: #2c3e50; margin-bottom: 5px; }
.card small { font-size: 0.8rem; color: #95a5a6; }

.net-profit { border-top: 5px solid #27ae60; }
.net-profit .value { color: #27ae60; }
.revenue { border-top: 5px solid #f39c12; }
.cogs { border-top: 5px solid #e74c3c; }
.asset { border-top: 5px solid #3498db; }

.text-danger { color: #e74c3c !important; }
.text-blue { color: #3498db !important; }

/* GRID CONTENT */
.content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 25px; }
.card-box { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
.chart-wrapper { height: 350px; position: relative; }
.no-data { height: 350px; display: flex; align-items: center; justify-content: center; color: #bdc3c7; font-size: 1.1rem; }

/* FORM EXPENSE */
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; }
.form-group input { width: 100%; padding: 12px; box-sizing: border-box; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; }
.btn-save { width: 100%; background: #e74c3c; color: white; padding: 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1rem; transition: 0.2s; }
.btn-save:hover { background: #c0392b; }
.expense-info { margin-top: 25px; text-align: center; padding-top: 20px; border-top: 1px dashed #eee; font-size: 1.1rem; }

/* RESPONSIVE */
@media (max-width: 900px) {
  .content-grid { grid-template-columns: 1fr; }
  .header { flex-direction: column; align-items: flex-start; }
  .date-filter { width: 100%; justify-content: space-between; }
}
</style>
