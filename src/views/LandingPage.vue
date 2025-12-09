<template>
  <div class="landing-wrapper">

    <transition name="fade-out">
      <div v-if="showSplash" class="splash-screen">
        <div class="splash-content">
          <div class="logo-circle">
            <span class="logo-icon">🍔</span>
          </div>
          <h1 class="splash-title">UMKM <span class="highlight">KULINER</span></h1>
          <p class="splash-subtitle">Memuat Aplikasi...</p>
          <div class="loading-bar">
            <div class="bar-fill"></div>
          </div>
        </div>
      </div>
    </transition>

    <div v-if="!showSplash" class="landing-container fade-in">

      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>

      <nav class="navbar animate-down">
        <div class="container nav-content">
          <div class="logo">UMKM <span class="text-green">KULINER</span></div>
          <div class="nav-links">
            <button @click="$router.push('/login')" class="btn-login">
              Login Masuk <span class="arrow">→</span>
            </button>
          </div>
        </div>
      </nav>

      <header class="hero">
        <div class="container hero-grid">

          <div class="hero-text reveal fade-right">
            <div class="badge-pill">🚀 Solusi #1 UMKM Indonesia</div>
            <h1>Kelola Bisnis Kuliner<br>Jadi <span class="text-green">Lebih Mudah</span></h1>
            <p>Aplikasi Kasir (POS), Manajemen Dapur, dan Laporan Keuangan dalam satu genggaman. Tinggalkan cara lama, beralih ke digital sekarang.</p>

            <div class="cta-group">
              <button @click="$router.push('/login')" class="btn-primary shadow-glow">
                Coba Gratis Sekarang
              </button>
            </div>

            <div class="stats-row">
              <div class="stat-item">
                <strong>500+</strong>
                <small>UMKM Terdaftar</small>
              </div>
              <div class="stat-item">
                <strong>24/7</strong>
                <small>Support Tim</small>
              </div>
            </div>
          </div>

          <div class="hero-visual reveal fade-left delay-200">
            <div class="visual-circle"></div>
            <img src="/images/login.png" alt="App Preview" class="app-mockup" />

            <div class="float-card glass card-revenue">
              <div class="icon-circle bg-green-light">📈</div>
              <div>
                <span class="label">Omset Hari Ini</span>
                <span class="value">Rp 2.500.000</span>
              </div>
            </div>

            <div class="float-card glass card-order">
              <div class="icon-circle bg-orange-light">🔔</div>
              <div>
                <span class="label">Pesanan Baru</span>
                <span class="value">Meja No. 4</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section class="features">
        <div class="container">
          <div class="section-header text-center reveal fade-up">
            <h2 class="section-title">Fitur Lengkap & Canggih</h2>
            <p class="section-subtitle">Didesain khusus untuk kecepatan operasional restoran & cafe.</p>
          </div>

          <div class="feature-grid">
            <div class="feature-card reveal fade-up delay-100">
              <div class="card-icon-bg bg-green-light">🛒</div>
              <h3>Smart Cashier (POS)</h3>
              <p>Transaksi super cepat hitungan detik. Support QRIS, cetak struk bluetooth, dan diskon otomatis.</p>
            </div>

            <div class="feature-card reveal fade-up delay-200">
              <div class="card-icon-bg bg-orange-light">👨‍🍳</div>
              <h3>Kitchen Display</h3>
              <p>Pesanan langsung muncul di layar dapur. Koki masak sesuai antrian tanpa kertas bon yang hilang.</p>
            </div>

            <div class="feature-card reveal fade-up delay-300">
              <div class="card-icon-bg bg-blue-light">📊</div>
              <h3>Laporan Real-time</h3>
              <p>Pantau omset, laba bersih, dan stok bahan baku dari mana saja. Data akurat anti boncos.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="contact-section">
        <div class="container">
          <div class="contact-box reveal zoom-in">
            <div class="contact-text">
              <h2>Butuh Bantuan atau Demo?</h2>
              <p>Tim support kami siap membantu Anda memulai langkah digitalisasi bisnis Anda.</p>
            </div>
            <div class="contact-buttons">
              <a href="https://wa.me/6285179826371" target="_blank" class="btn-wa">
                <span class="icon">💬</span> Chat WhatsApp
              </a>
              <a href="mailto:admin@umkmkuliner.com" class="btn-email">
                <span class="icon">✉️</span> Kirim Email
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div class="container footer-content reveal fade-up">
          <p>&copy; 2025 <strong>UMKM KULINER</strong>. BUILD WITH KELOMPOK 1.</p>
        </div>
      </footer>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

const showSplash = ref(true);

onMounted(() => {
  setTimeout(() => {
    showSplash.value = false;
    nextTick(() => {
      initScrollObserver();
    });
  }, 2000);
});

// FUNGSI ANIMASI SCROLL
const initScrollObserver = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
};
</script>

<style>
/* === HIDE SCROLLBAR (TAPI TETAP BISA SCROLL) === */

/* Untuk Chrome, Safari, dan Opera */
html::-webkit-scrollbar,
body::-webkit-scrollbar,
.landing-wrapper::-webkit-scrollbar {
  display: none;
}

/* Untuk Firefox, IE, dan Edge */
html, body, .landing-wrapper {
  -ms-overflow-style: none;  /* IE dan Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap');

/* --- 1. CONFIG GLOBAL --- */
:root { --primary: #10b981; --dark: #0f172a; --gray: #64748b; --white: #ffffff; }

.landing-wrapper {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background-color: #ffffff;
  color: #0f172a;
  overflow-x: hidden;
  width: 100%;
}

.container { max-width: 1100px; margin: 0 auto; padding: 0 20px; position: relative; z-index: 2; }

/* --- 2. ANIMASI (FIXED) --- */
/* Animasi Navbar (Langsung Turun) */
.animate-down {
  animation: slideDown 0.8s ease-out forwards;
  opacity: 0; /* Mulai invisible */
}
@keyframes slideDown {
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Animasi Scroll Reveal (Tunggu Scroll) */
.reveal { opacity: 0; transition: all 1s cubic-bezier(0.5, 0, 0, 1); will-change: opacity, transform; }
.fade-up { transform: translateY(60px); }
.fade-right { transform: translateX(-60px); }
.fade-left { transform: translateX(60px); }
.zoom-in { transform: scale(0.85); }

.reveal.active { opacity: 1; transform: translate(0) scale(1); }

.delay-100 { transition-delay: 0.1s; }
.delay-200 { transition-delay: 0.2s; }
.delay-300 { transition-delay: 0.3s; }

/* --- 3. SPLASH SCREEN --- */
.splash-screen { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: #ffffff; display: flex; justify-content: center; align-items: center; z-index: 9999; }
.splash-content { text-align: center; }
.logo-circle { width: 80px; height: 80px; background: #ecfdf5; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin: 0 auto 20px; animation: bounce 2s infinite; }
.logo-icon { font-size: 2.5rem; }
.splash-title { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; }
.highlight { color: #10b981; }
.splash-subtitle { color: #64748b; margin-top: 5px; }
.loading-bar { width: 200px; height: 6px; background: #f1f5f9; border-radius: 10px; margin: 30px auto 0; overflow: hidden; }
.bar-fill { height: 100%; background: #10b981; width: 0%; animation: load 2s ease-in-out forwards; }
@keyframes load { 0% { width: 0%; } 100% { width: 100%; } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.fade-out-leave-active { transition: opacity 0.8s ease; }
.fade-out-leave-to { opacity: 0; }
.fade-in { animation: fadeInContent 1s ease-out; }
@keyframes fadeInContent { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

/* --- 4. COMPONENT STYLES --- */
.bg-shape { position: absolute; border-radius: 50%; filter: blur(80px); z-index: 0; opacity: 0.6; }
.shape-1 { width: 500px; height: 500px; background: #ecfdf5; top: -100px; right: -100px; }
.shape-2 { width: 400px; height: 400px; background: #eff6ff; bottom: 0; left: -100px; }

/* Navbar */
.navbar { position: fixed; top: 0; width: 100%; z-index: 1000; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border-bottom: 1px solid #f1f5f9; padding: 15px 0; }
.nav-content { display: flex; justify-content: space-between; align-items: center; }
.logo { font-size: 1.5rem; font-weight: 800; }
.text-green { color: #10b981; }
.btn-login { padding: 10px 24px; background: #0f172a; color: white; border-radius: 50px; border: none; font-weight: 600; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; }
.btn-login:hover { background: #10b981; transform: translateY(-2px); }

/* Hero */
.hero { padding: 140px 0 80px; position: relative; }
.hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: center; }
.badge-pill { display: inline-block; padding: 6px 16px; background: #ecfdf5; color: #059669; font-weight: 700; font-size: 0.85rem; border-radius: 50px; margin-bottom: 20px; border: 1px solid #d1fae5; }
.hero-text h1 { font-size: 3rem; line-height: 1.2; font-weight: 800; margin-bottom: 20px; color: #0f172a; }
.hero-text p { font-size: 1.1rem; color: #64748b; line-height: 1.6; margin-bottom: 35px; }
.btn-primary { padding: 15px 35px; background: #10b981; color: white; border: none; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: 0.3s; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3); }
.btn-primary:hover { background: #059669; transform: translateY(-3px); }
.stats-row { display: flex; gap: 40px; border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 30px; }
.stat-item strong { display: block; font-size: 1.8rem; font-weight: 800; color: #0f172a; }
.stat-item small { color: #64748b; font-weight: 500; }

/* Visual */
.hero-visual { position: relative; display: flex; justify-content: center; }
.visual-circle { width: 400px; height: 400px; background: #f0f9ff; border-radius: 50%; position: absolute; z-index: -1; }
.app-mockup { width: 100%; max-width: 450px; border-radius: 20px; box-shadow: 0 20px 50px -10px rgba(0,0,0,0.15); border: 4px solid white; transform: rotate(-2deg); transition: 0.5s; background: #fff; }
.hero-visual:hover .app-mockup { transform: rotate(0deg) scale(1.02); }
.float-card { position: absolute; background: white; padding: 12px 18px; border-radius: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; animation: float 5s ease-in-out infinite; z-index: 2; }
.card-revenue { top: 40px; left: -30px; }
.card-order { bottom: 60px; right: -20px; animation-delay: 2.5s; }
.icon-circle { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
.bg-green-light { background: #ecfdf5; color: #10b981; }
.bg-orange-light { background: #fff7ed; color: #f97316; }
.label { font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: uppercase; display: block; }
.value { font-weight: 800; color: #0f172a; font-size: 0.95rem; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

/* Features */
.features { padding: 80px 0; background: #ffffff; }
.section-header { margin-bottom: 50px; }
.section-title { font-size: 2.2rem; font-weight: 800; margin-bottom: 10px; color: #0f172a; }
.section-subtitle { color: #64748b; }
.text-center { text-align: center; }
.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
.feature-card { background: white; padding: 35px; border-radius: 20px; border: 1px solid #f1f5f9; transition: 0.3s; }
.feature-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.05); border-color: #10b981; }
.card-icon-bg { width: 60px; height: 60px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 20px; }
.bg-blue-light { background: #eff6ff; color: #3b82f6; }
.feature-card h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 10px; color: #0f172a; }
.feature-card p { color: #64748b; line-height: 1.6; }

/* Contact */
.contact-section { padding: 80px 0; }
.contact-box { background: #1e293b; border-radius: 24px; padding: 60px; text-align: center; color: white; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
.contact-text h2 { font-size: 2rem; margin-bottom: 15px; color: white; }
.contact-text p { color: #cbd5e1; margin-bottom: 30px; font-size: 1.1rem; }
.contact-buttons { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
.btn-wa { background: #25D366; color: white; padding: 12px 30px; border-radius: 50px; text-decoration: none; font-weight: 700; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
.btn-wa:hover { background: #1ebc57; transform: scale(1.05); }
.btn-email { background: white; color: #1e293b; padding: 12px 30px; border-radius: 50px; text-decoration: none; font-weight: 700; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
.btn-email:hover { background: #f1f5f9; transform: scale(1.05); }

/* Footer */
footer { border-top: 1px solid #f1f5f9; padding: 40px 0; text-align: center; margin-top: 40px; }
footer p { color: #64748b; font-size: 0.9rem; }

@media (max-width: 900px) {
  .hero-grid { grid-template-columns: 1fr; text-align: center; }
  .hero-visual { margin-top: 50px; }
  .stats-row { justify-content: center; }
  .feature-grid { padding: 0 20px; }
}
</style>
