<template>
  <div class="dashboard-container">

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
    <div class="welcome-banner">
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

      <div class="stat-card red" @click="$router.push('/admin/ingredients')" style="cursor: pointer">
        <div class="icon">⚠️</div>
        <div class="info">
          <h3>Stok Alert</h3>
          <div class="number">{{ summary.low_stock }} <small>Item</small></div>
          <small v-if="summary.low_stock > 0" style="color: #e74c3c;">Klik untuk cek gudang</small>
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
      <div v-else class="loading-chart">
        <div v-if="isLoading" class="spinner"></div>
        <span v-else>Tidak ada data penjualan minggu ini.</span>
      </div>
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// --- STATE ALERT ---
const notification = ref({ show: false, type: 'success', message: '' });

const triggerAlert = (message, type = 'success') => {
  notification.value = { show: true, type, message };
  setTimeout(() => { notification.value.show = false; }, 3000);
};
// -------------------

// STATE DASHBOARD
const summary = ref({ revenue_today: 0, trx_today: 0, low_stock: 0, staff_active: 0 });
const chartData = ref({ labels: [], datasets: [] });
const isLoading = ref(true);

// Chart Config
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } }
};

// FETCH DATA
const fetchDashboard = async () => {
  isLoading.value = true;
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
        tension: 0.3,
        fill: false,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }]
    };
  } catch (err) {
    console.error("Gagal load dashboard", err);
    triggerAlert('Gagal memuat data dashboard. Periksa koneksi.', 'danger');
  } finally {
    isLoading.value = false;
  }
};

// HELPER
const formatRp = (val) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val);
const performanceStatus = computed(() => summary.value.revenue_today > 0 ? 'bagus 🚀' : 'tenang ☕');

onMounted(fetchDashboard);
</script>

<style scoped>
/* =========================================
   STYLE ALERT (FLOATING TOAST)
   ========================================= */
.alert-floating {
  position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
  z-index: 11000;
  display: flex; align-items: center; gap: 15px;
  padding: 12px 25px; border-radius: 50px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15); min-width: 320px;
  animation: slideDown 0.4s ease-out;
  background: white; font-weight: 600; font-size: 0.95rem; color: #333;
}
.alert-content { flex: 1; display: flex; align-items: center; gap: 10px; }
.alert-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; opacity: 0.6; }
.alert-success { border: 2px solid #10b981; color: #065f46; background: #ecfdf5; }
.alert-danger { border: 2px solid #ef4444; color: #991b1b; background: #fef2f2; }
.alert-warning { border: 2px solid #f59e0b; color: #92400e; background: #fffbeb; }

@keyframes slideDown {
  from { transform: translateX(-50%) translateY(-30px); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}

/* =========================================
   STYLE DASHBOARD
   ========================================= */
.dashboard-container { font-family: 'Segoe UI', sans-serif;  }
.welcome-banner { margin-bottom: 30px; }
.welcome-banner h1 { margin: 0; color: #2c3e50; font-size: 1.8rem; }
.welcome-banner p { color: #7f8c8d; margin-top: 5px; }

/* STATS GRID */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  transition: transform 0.2s;
  border-left: 5px solid transparent;
}

.stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.08); }

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
  width: 55px; height: 55px;
  border-radius: 50%;
  display: flex; justify-content: center; align-items: center;
  font-size: 1.6rem; margin-right: 20px;
}

.info h3 { margin: 0; font-size: 0.9rem; color: #95a5a6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.info .number { margin: 5px 0 0; font-size: 1.5rem; font-weight: 800; color: #2c3e50; }
.info small { font-size: 0.8rem; color: #bdc3c7; font-weight: normal; }

/* CHART SECTION */
.chart-section {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.chart-section h3 { margin-top: 0; color: #2c3e50; font-size: 1.2rem; margin-bottom: 20px; }
.chart-wrapper { height: 350px; }
.loading-chart { height: 350px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #94a3b8; }

/* SPINNER LOADING */
.spinner {
  width: 30px; height: 30px; border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db; border-radius: 50%;
  animation: spin 1s linear infinite; margin-bottom: 10px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>
