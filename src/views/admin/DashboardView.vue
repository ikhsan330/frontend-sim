<template>
  <div class="dashboard-container">
    <div class="welcome-banner">
      <h1>🚀 Dashboard Admin</h1>
      <p>Selamat datang, performa bisnis hari ini terlihat {{ performanceStatus }}.</p>
    </div>

    <div class="stats-grid">

      <div class="stat-card blue">
        <div class="icon">💰</div>
        <div class="info">
          <h3>Omset Hari Ini</h3>
          <div class="number">{{ formatRp(summary.revenue_today) }}</div>
        </div>
      </div>

      <div class="stat-card green">
        <div class="icon">🧾</div>
        <div class="info">
          <h3>Transaksi Hari Ini</h3>
          <div class="number">{{ summary.trx_today }} <small>Bon</small></div>
        </div>
      </div>

      <div class="stat-card red" @click="$router.push('/production/stocks')" style="cursor: pointer">
        <div class="icon">⚠️</div>
        <div class="info">
          <h3>Stok Alert</h3>
          <div class="number">{{ summary.low_stock }} <small>Item</small></div>
          <small v-if="summary.low_stock > 0">Klik untuk cek gudang</small>
        </div>
      </div>

      <div class="stat-card orange">
        <div class="icon">👥</div>
        <div class="info">
          <h3>Total Staff</h3>
          <div class="number">{{ summary.staff_active }} <small>Orang</small></div>
        </div>
      </div>
    </div>

    <div class="chart-section">
      <h3>📊 Tren Penjualan 7 Hari Terakhir</h3>
      <div class="chart-wrapper" v-if="chartData.labels.length > 0">
        <Line :data="chartData" :options="chartOptions" />
      </div>
      <div v-else class="loading-chart">Memuat data grafik...</div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import apiClient from '../../api/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'vue-chartjs';

// Register Chart Components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// STATE
const summary = ref({ revenue_today: 0, trx_today: 0, low_stock: 0, staff_active: 0 });
const chartData = ref({ labels: [], datasets: [] });

// Chart Options (Biar cantik)
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false } // Sembunyikan legenda biar bersih
  },
  scales: {
    y: { beginAtZero: true }
  }
};

// FETCH DATA
const fetchDashboard = async () => {
  try {
    const res = await apiClient.get('/admin/dashboard');
    summary.value = res.data.summary;

    // Setup Chart Data
    chartData.value = {
      labels: res.data.chart.labels,
      datasets: [{
        label: 'Omset',
        backgroundColor: '#3498db',
        borderColor: '#3498db',
        data: res.data.chart.series,
        tension: 0.3, // Garis melengkung halus
        fill: false
      }]
    };
  } catch (err) {
    console.error("Gagal load dashboard", err);
  }
};

// HELPER
const formatRp = (val) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val);
const performanceStatus = computed(() => summary.value.revenue_today > 0 ? 'bagus' : 'tenang');

onMounted(fetchDashboard);
</script>

<style scoped>
.dashboard-container { font-family: 'Segoe UI', sans-serif; }
.welcome-banner { margin-bottom: 30px; }
.welcome-banner h1 { margin: 0; color: #2c3e50; }
.welcome-banner p { color: #7f8c8d; }

/* STATS GRID */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  transition: transform 0.2s;
  border-left: 5px solid transparent;
}

.stat-card:hover { transform: translateY(-5px); box-shadow: 0 8px 15px rgba(0,0,0,0.1); }

/* Warna Aksen Kartu */
.stat-card.blue { border-left-color: #3498db; }
.stat-card.blue .icon { background: #ebf5fb; color: #3498db; }

.stat-card.green { border-left-color: #2ecc71; }
.stat-card.green .icon { background: #eafaf1; color: #2ecc71; }

.stat-card.red { border-left-color: #e74c3c; }
.stat-card.red .icon { background: #fdedec; color: #e74c3c; }

.stat-card.orange { border-left-color: #f39c12; }
.stat-card.orange .icon { background: #fef5e7; color: #f39c12; }

.icon {
  width: 50px; height: 50px;
  border-radius: 50%;
  display: flex; justify-content: center; align-items: center;
  font-size: 1.5rem;
  margin-right: 15px;
}

.info h3 { margin: 0; font-size: 0.9rem; color: #95a5a6; font-weight: normal; }
.info .number { margin: 5px 0 0; font-size: 1.4rem; font-weight: bold; color: #2c3e50; }
.info small { font-size: 0.8rem; color: #bdc3c7; }

/* CHART SECTION */
.chart-section {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.chart-wrapper { height: 350px; }
.loading-chart { height: 350px; display: flex; justify-content: center; align-items: center; color: #ccc; }
</style>
