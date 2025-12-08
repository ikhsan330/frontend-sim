import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import LoginView from '../views/LoginView.vue'
import AdminLayout from '../layouts/AdminLayout.vue' // Import Layout Baru
import { useAuthStore } from '../stores/auth'
import UserList from '../views/admin/UserList.vue'
import IngredientList from '../views/admin/IngredientList.vue'
import ProductList from '../views/admin/ProductList.vue'
import CashierLayout from '../layouts/CashierLayout.vue'
import POSView from '../views/cashier/POSView.vue'
import ProductionLayout from '../layouts/ProductionLayout.vue'
import StockManager from '../views/production/StockManager.vue'
import KitchenDisplay from '../views/production/KitchenDisplay.vue'
import ReportView from '../views/admin/ReportView.vue'
import DashboardView from '../views/admin/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingPage
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
    },

    // --- ROUTE ADMIN (Dengan Layout) ---
    {
      path: '/admin',
      component: AdminLayout, // Layout sebagai pembungkus
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: 'dashboard', // url jadi: /admin/dashboard
          name: 'admin-dashboard',
          component: DashboardView,
        },
        {
          path: 'users', // url jadi: /admin/users
          name: 'admin-users',
          component: UserList,
        },
        {
          path: 'products', // url jadi: /admin/products
          name: 'admin-products',
          component: ProductList,
        },
        {
          path: 'ingredients', // /admin/ingredients
          name: 'admin-ingredients',
          component: IngredientList,
        },
        {
          path: 'reports', // /admin/reports
          name: 'admin-reports',
          component: ReportView,
        },
      ],
    },

    // Route Kasir & Kitchen (Belum pakai layout, biarkan dulu)
    {
      path: '/cashier',
      component: CashierLayout, // Layout khusus kasir
      meta: { requiresAuth: true, role: 'cashier' },
      children: [
        {
          path: 'pos', // /cashier/pos
          name: 'cashier-pos',
          component: POSView,
        },
      ],
    },
    // --- ROUTE PRODUCTION (DAPUR/GUDANG) ---
    {
      path: '/production',
      component: ProductionLayout,
      meta: { requiresAuth: true, role: 'kitchen' },
      children: [
        {
          path: 'stocks', // /production/stocks
          name: 'prod-stocks',
          component: StockManager,
        },
        {
          path: 'queue', // /production/queue
          name: 'prod-queue',
          component: KitchenDisplay,
        },
        // Redirect default
        {
          path: '',
          redirect: '/production/stocks',
        },
      ],
    },
    {
      path: '/',
      redirect: '/login',
    },
  ],
})

// Navigation Guard (Satpam)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.role

  // 1. Jika halaman butuh login, tapi user belum login -> Tendang ke Login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  }
  // 2. Jika halaman khusus Guest (Login), tapi user SUDAH login -> Tendang ke Dashboard masing-masing
  else if (to.meta.requiresGuest && isAuthenticated) {
    if (userRole === 'admin') next('/admin/dashboard')
    else if (userRole === 'cashier') next('/cashier/pos')
    else if (userRole === 'kitchen') next('/kitchen/orders')
    else next('/')
  }
  // 3. (Opsional) Cek Role spesifik (misal Kasir coba masuk halaman Admin)
  else if (to.meta.role && to.meta.role !== userRole && userRole !== 'admin') {
    // Admin boleh akses mana saja (sesuai decorator backend), tapi di frontend kita batasi dulu biar rapi
    // Atau kalau mau ketat:
    alert('Anda tidak punya akses ke halaman ini!')
    next(false) // Batalkan navigasi
  } else {
    next()
  }
})

export default router
