<template>
  <div class="landing-container">

    <nav class="navbar">
      <div class="logo">UMKM <span class="highlight">KULINER</span></div>
      <div class="nav-links">
        <button @click="$router.push('/login')" class="btn-login">Login Masuk</button>
      </div>
    </nav>

    <header class="hero">
      <div class="hero-content">
        <span class="badge">🚀 Versi 1.0 Rilis</span>
        <h1>Solusi Cerdas untuk<br>Bisnis Kuliner Anda</h1>
        <p>Satu aplikasi untuk Kasir (POS), Manajemen Dapur, dan Laporan Keuangan. Ringan, Cepat, dan Mudah digunakan.</p>
        <div class="cta-group">
          <button @click="$router.push('/login')" class="btn-primary">Mulai Sekarang ➔</button>
          <button class="btn-secondary">Pelajari Fitur</button>
        </div>
      </div>

      <div class="hero-visual">
        <div class="circle-bg"></div>
        <div class="floating-card card-1">
          <span class="icon">📈</span>
          <div>
            <strong>Omset Naik</strong>
            <small>+25% Bulan ini</small>
          </div>
        </div>
        <div class="floating-card card-2">
          <span class="icon">🛒</span>
          <div>
            <strong>Transaksi Cepat</strong>
            <small>Anti Antri</small>
          </div>
        </div>
        <div class="floating-card card-3">
          <span class="icon">👨‍🍳</span>
          <div>
            <strong>Dapur</strong>
            <small>Pesanan Masuk!</small>
          </div>
        </div>
      </div>
    </header>

    <section class="features">
      <div class="section-header">
        <h2>Fitur Unggulan</h2>
        <p>Semua yang Anda butuhkan untuk operasional resto ada di sini.</p>
      </div>

      <div class="feature-grid">
        <div class="feature-card">
          <div class="icon-box green">🛒</div>
          <h3>Point of Sales (POS)</h3>
          <p>Catat pesanan pelanggan dengan cepat. Mendukung pembayaran Tunai dan QRIS.</p>
        </div>

        <div class="feature-card orange">
          <div class="icon-box orange">👨‍🍳</div>
          <h3>Manajemen Dapur</h3>
          <p>Pesanan otomatis muncul di layar dapur. Koki bisa langsung eksekusi tanpa teriak.</p>
        </div>

        <div class="feature-card blue">
          <div class="icon-box blue">📊</div>
          <h3>Laporan Keuangan</h3>
          <p>Pantau laba rugi, HPP, dan performa penjualan harian secara real-time.</p>
        </div>
      </div>
    </section>

    <section class="contact">
      <div class="contact-box">
        <h2>Butuh Bantuan atau Demo?</h2>
        <p>Tim support kami siap membantu Anda memulai.</p>
        <div class="contact-buttons">
          <a href="#" class="btn-whatsapp">
            <span class="icon">💬</span> Chat WhatsApp
          </a>
          <a href="#" class="btn-email">
            <span class="icon">✉️</span> Kirim Email
          </a>
        </div>
      </div>
    </section>

    <footer>
      <p>&copy; 2025 UMKM KULINER System. Built for Success.</p>
    </footer>

  </div>
</template>

<script setup>
// Tidak butuh JS berat, murni CSS
</script>

<style scoped>
/* IMPORT FONT POPPINS */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

/* VARIABEL WARNA (Konsisten dengan Dashboard) */
:root {
  --primary: #10b981;      /* Hijau Emerald */
  --primary-dark: #059669;
  --text-dark: #1e293b;    /* Hitam Slate */
  --text-gray: #64748b;    /* Abu Slate */
  --bg-light: #f8fafc;
  --white: #ffffff;
}

.landing-container {
  font-family: 'Poppins', sans-serif;
  color: #1e293b;
  background-color: #ffffff;
  overflow-x: hidden;
}

/* NAVBAR */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 5%;
  position: fixed;
  top: 0; left: 0; right: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  z-index: 1000;
  border-bottom: 1px solid #f1f5f9;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.5px;
}
.highlight { color: #10b981; }

.btn-login {
  padding: 8px 24px;
  background: transparent;
  border: 2px solid #10b981;
  color: #10b981;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}
.btn-login:hover {
  background: #10b981;
  color: white;
}

/* HERO SECTION */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 140px 5% 80px;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); /* Gradasi Hijau Sangat Muda */
  min-height: 90vh;
}

.hero-content { max-width: 600px; }

.badge {
  background: #d1fae5;
  color: #059669;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 15px;
  display: inline-block;
}

.hero-content h1 {
  font-size: 3.5rem;
  line-height: 1.2;
  margin-bottom: 20px;
  color: #1e293b;
  font-weight: 800;
}

.hero-content p {
  font-size: 1.1rem;
  color: #64748b;
  margin-bottom: 40px;
  line-height: 1.6;
}

.cta-group { display: flex; gap: 15px; }

.btn-primary {
  padding: 12px 30px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  transition: transform 0.2s;
}
.btn-primary:hover { transform: translateY(-3px); background: #059669; }

.btn-secondary {
  padding: 12px 30px;
  background: white;
  color: #64748b;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}
.btn-secondary:hover { border-color: #10b981; color: #10b981; }

/* HERO VISUAL (RINGAN) */
.hero-visual {
  position: relative;
  width: 500px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.circle-bg {
  width: 400px; height: 400px;
  background: #ecfdf5;
  border-radius: 50%;
  position: absolute;
  z-index: 1;
}

.floating-card {
  position: absolute;
  background: white;
  padding: 15px 25px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 2;
  animation: float 6s ease-in-out infinite;
  border: 1px solid #f1f5f9;
}

.floating-card .icon { font-size: 1.8rem; }
.floating-card div { display: flex; flex-direction: column; }
.floating-card strong { font-size: 0.9rem; color: #1e293b; }
.floating-card small { font-size: 0.75rem; color: #64748b; }

.card-1 { top: 50px; left: 20px; animation-delay: 0s; }
.card-2 { top: 160px; right: 0; animation-delay: 2s; }
.card-3 { bottom: 60px; left: 60px; animation-delay: 4s; }

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}

/* FEATURES SECTION */
.features { padding: 100px 5%; background: white; text-align: center; }
.section-header { margin-bottom: 60px; }
.section-header h2 { font-size: 2.5rem; color: #1e293b; margin-bottom: 10px; }
.section-header p { color: #64748b; }

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.feature-card {
  padding: 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border: 1px solid #f1f5f9;
  transition: 0.3s;
}
.feature-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }

.icon-box {
  width: 70px; height: 70px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; margin: 0 auto 20px;
}
.green { background: #ecfdf5; color: #10b981; }
.orange { background: #fff7ed; color: #f97316; }
.blue { background: #eff6ff; color: #3b82f6; }

.feature-card h3 { font-size: 1.2rem; margin-bottom: 10px; }
.feature-card p { color: #64748b; font-size: 0.95rem; line-height: 1.6; }

/* CONTACT SECTION */
.contact { padding: 80px 5%; background: #f8fafc; text-align: center; }
.contact-box {
  background: #1e293b; /* Kotak Gelap untuk Kontras */
  color: white;
  padding: 60px;
  border-radius: 20px;
  max-width: 900px;
  margin: 0 auto;
}
.contact-box h2 { font-size: 2rem; margin-bottom: 15px; }
.contact-box p { color: #cbd5e1; margin-bottom: 30px; }

.contact-buttons { display: flex; justify-content: center; gap: 20px; }
.btn-whatsapp, .btn-email {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 25px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  transition: 0.2s;
}
.btn-whatsapp { background: #25D366; color: white; }
.btn-whatsapp:hover { background: #1ebc57; }
.btn-email { background: white; color: #1e293b; }
.btn-email:hover { background: #f1f5f9; }

/* FOOTER */
footer {
  text-align: center; padding: 40px; background: white; color: #94a3b8; font-size: 0.9rem;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .hero { flex-direction: column; text-align: center; padding-top: 120px; }
  .hero-visual { display: none; } /* Sembunyikan animasi di HP agar ringan */
  .hero-content h1 { font-size: 2.5rem; }
  .cta-group { justify-content: center; }
  .contact-buttons { flex-direction: column; }
}
</style>
