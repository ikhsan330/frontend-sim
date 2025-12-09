<template>
  <div class="page-container">

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
        <div class="modal-actions">
          <button @click="handleDialogCancel" class="btn-cancel">Batal</button>
          <button @click="handleDialogConfirm" :class="dialog.type === 'danger' ? 'btn-danger' : 'btn-save'">
            {{ dialog.confirmText }}
          </button>
        </div>
      </div>
    </div>
    <div class="header">
      <div>
        <h1>🍔 Master Produk (Menu)</h1>
        <p class="subtitle">Kelola menu makanan dan atur resep produksi</p>
      </div>
      <button @click="openProductModal()" class="btn-add">+ Menu Baru</button>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Menu</th>
            <th>Kategori</th>
            <th>Harga Jual</th>
            <th>Status</th>
            <th class="text-right">Aksi & Resep</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="products.length === 0">
            <td colspan="5" class="text-center">Belum ada menu yang terdaftar.</td>
          </tr>
          <tr v-for="prod in products" :key="prod.id">
            <td>
              <strong>{{ prod.name }}</strong>
            </td>
            <td>
              <span class="badge gray">{{ prod.category }}</span>
            </td>
            <td>{{ formatRp(prod.price) }}</td>
            <td>
              <span :class="['badge', prod.is_active ? 'green' : 'red']">
                {{ prod.is_active ? 'Aktif' : 'Non-Aktif' }}
              </span>
            </td>
            <td class="text-right">
              <button @click="openRecipeModal(prod)" class="btn-recipe" title="Atur Resep">🧪 Resep</button>
              <button @click="openProductModal(prod)" class="btn-edit" title="Edit Menu">✏️</button>
              <button @click="deleteProduct(prod.id)" class="btn-delete" title="Hapus Menu">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showProductModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ isEditing ? 'Edit Menu' : 'Tambah Menu Baru' }}</h3>
        <form @submit.prevent="saveProduct">
          <div class="form-group">
            <label>Nama Menu</label>
            <input v-model="form.name" required placeholder="Contoh: Nasi Goreng Spesial" class="input-std" />
          </div>
          <div class="form-group">
            <label>Kategori</label>
            <select v-model="form.category" class="input-std">
              <option value="Food">Makanan</option>
              <option value="Drink">Minuman</option>
              <option value="Snack">Snack</option>
            </select>
          </div>
          <div class="form-group">
            <label>Harga Jual (Rp)</label>
            <input v-model="form.price" type="number" required placeholder="0" class="input-std" />
          </div>
          <div class="form-group">
            <label>Status Jual</label>
            <select v-model="form.is_active" class="input-std">
              <option :value="true">Dijual (Aktif)</option>
              <option :value="false">Disembunyikan</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showProductModal = false" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-save">Simpan</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showRecipeModal" class="modal-overlay">
      <div class="modal-content large-modal">
        <h3>🧪 Resep: <span class="highlight">{{ selectedProduct.name }}</span></h3>
        <p class="modal-subtitle">Tentukan bahan baku yang berkurang setiap 1 porsi menu ini terjual.</p>

        <div class="recipe-list">
          <table class="mini-table">
            <thead>
              <tr>
                <th>Bahan Baku</th>
                <th>Takaran Per Porsi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="currentRecipes.length === 0">
                <td colspan="3" class="text-center">Belum ada resep yang diatur.</td>
              </tr>
              <tr v-for="r in currentRecipes" :key="r.recipe_id">
                <td>{{ r.ingredient_name }}</td>
                <td><strong>{{ r.quantity }}</strong> {{ r.unit }}</td>
                <td>
                  <button @click="removeRecipeItem(r.recipe_id)" class="btn-small-danger">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr>

        <form @submit.prevent="addRecipeItem" class="add-recipe-form">
          <label>Tambah Bahan Baru:</label>
          <div class="row">
            <select v-model="recipeForm.ingredient_id" required class="input-std flex-2">
              <option disabled value="">Pilih Bahan...</option>
              <option v-for="ing in allIngredients" :key="ing.id" :value="ing.id">
                {{ ing.name }} (Satuan: {{ ing.unit }})
              </option>
            </select>
            <input v-model="recipeForm.quantity_needed" type="number" step="0.01" placeholder="Jml" required class="input-std flex-1" />
            <button type="submit" class="btn-add-small">+</button>
          </div>
        </form>

        <div class="modal-actions">
          <button type="button" @click="showRecipeModal = false" class="btn-cancel">Tutup</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../../api/axios';

// --- STATE ALERT & DIALOG ---
const notification = ref({ show: false, type: 'success', message: '' });
const dialog = ref({ show: false, title: '', message: '', type: 'confirm', confirmText: 'Ya', resolve: null });

// Helper: Alert
const triggerAlert = (message, type = 'success') => {
  notification.value = { show: true, type, message };
  setTimeout(() => { notification.value.show = false; }, 3000);
};

// Helper: Dialog
const useDialog = (title, message, type = 'danger', confirmText = 'Ya') => {
  return new Promise((resolve) => {
    dialog.value = { show: true, title, message, type, confirmText, resolve };
  });
};

const handleDialogConfirm = () => {
  dialog.value.show = false;
  if (dialog.value.resolve) dialog.value.resolve(true);
};

const handleDialogCancel = () => {
  dialog.value.show = false;
  if (dialog.value.resolve) dialog.value.resolve(false);
};
// ----------------------------

// STATE UTAMA
const products = ref([]);
const allIngredients = ref([]); // Untuk dropdown di modal resep

// STATE MODAL PRODUK
const showProductModal = ref(false);
const isEditing = ref(false);
const form = ref({ id: null, name: '', category: 'Food', price: 0, is_active: true });

// STATE MODAL RESEP
const showRecipeModal = ref(false);
const selectedProduct = ref({});
const currentRecipes = ref([]);
const recipeForm = ref({ ingredient_id: '', quantity_needed: '' });

// 1. CRUD PRODUK ============================
const fetchProducts = async () => {
  try {
    const res = await apiClient.get('/admin/products');
    products.value = res.data;
  } catch (err) { console.error(err); }
};

const saveProduct = async () => {
  try {
    if (isEditing.value) {
      await apiClient.put(`/admin/products/${form.value.id}`, form.value);
      triggerAlert('Menu berhasil diperbarui!', 'success');
    } else {
      await apiClient.post('/admin/products', form.value);
      triggerAlert('Menu baru berhasil dibuat!', 'success');
    }
    showProductModal.value = false;
    fetchProducts();
  } catch (err) { triggerAlert(err.response?.data?.message,'Gagal menyimpan produk', 'danger'); }
};

const deleteProduct = async (id) => {
  // Ganti Confirm Bawaan
  const confirmed = await useDialog(
    'Hapus Menu?',
    'Menu ini akan dihapus permanen beserta pengaturan resepnya.',
    'danger',
    'Hapus'
  );

  if (!confirmed) return;

  try {
    await apiClient.delete(`/admin/products/${id}`);
    triggerAlert('Menu berhasil dihapus.', 'success');
    fetchProducts();
  } catch (err) { triggerAlert(err.response?.data?.message,'Gagal menghapus menu.', 'danger'); }
};

// 2. MANAJEMEN RESEP ========================
const fetchAllIngredients = async () => {
  const res = await apiClient.get('/admin/ingredients');
  allIngredients.value = res.data;
};

const openRecipeModal = async (product) => {
  selectedProduct.value = product;
  showRecipeModal.value = true;
  recipeForm.value = { ingredient_id: '', quantity_needed: '' };

  if (allIngredients.value.length === 0) await fetchAllIngredients();
  refreshRecipeList(product.id);
};

const refreshRecipeList = async (productId) => {
  try {
    const res = await apiClient.get(`/admin/recipes/${productId}`);
    currentRecipes.value = res.data.recipe_items;
  } catch (err) { console.error(err); }
};

const addRecipeItem = async () => {
  try {
    await apiClient.post('/admin/recipes', {
      product_id: selectedProduct.value.id,
      ingredient_id: recipeForm.value.ingredient_id,
      quantity_needed: recipeForm.value.quantity_needed
    });
    refreshRecipeList(selectedProduct.value.id);
    recipeForm.value.quantity_needed = '';
    triggerAlert('Bahan resep ditambahkan', 'success');
  } catch (err) {
    triggerAlert(err.response?.data?.message || 'Gagal menambah resep', 'danger');
  }
};

const removeRecipeItem = async (recipeId) => {
  // Dialog konfirmasi kecil tidak perlu full modal, cukup confirm jika diinginkan
  // Tapi untuk konsistensi, pakai useDialog
  const confirmed = await useDialog('Hapus Bahan?', 'Bahan ini akan dihapus dari resep menu ini.', 'danger', 'Hapus');
  if(!confirmed) return;

  try {
    await apiClient.delete(`/admin/recipes/${recipeId}`);
    refreshRecipeList(selectedProduct.value.id);
    triggerAlert('Item resep dihapus', 'success');
  } catch (err) { triggerAlert(err.response?.data?.message,'Gagal hapus item', 'danger'); }
};

// HELPER
const openProductModal = (prod = null) => {
  showProductModal.value = true;
  if (prod) {
    isEditing.value = true;
    form.value = { ...prod };
  } else {
    isEditing.value = false;
    form.value = { id: null, name: '', category: 'Food', price: 0, is_active: true };
  }
};

const formatRp = (val) => 'Rp ' + new Intl.NumberFormat('id-ID').format(val);

onMounted(fetchProducts);
</script>

<style scoped>
/* =========================================
   STYLE ALERT & DIALOG
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

@keyframes slideDown {
  from { transform: translateX(-50%) translateY(-30px); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}

/* DIALOG MODAL */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.5); z-index: 10000;
  display: flex; justify-content: center; align-items: center;
  backdrop-filter: blur(2px);
}
.modal-content {
  background: white; padding: 25px; border-radius: 12px; width: 450px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}
.dialog-content { text-align: center; width: 350px; } /* Override size for dialog */
.dialog-content h3 { margin-top: 0; color: #1e293b; margin-bottom: 10px; }
.dialog-content p { color: #64748b; margin-bottom: 20px; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
.dialog-content .modal-actions { justify-content: center; } /* Center buttons for dialog */

.btn-cancel { padding: 10px 20px; background: #f1f5f9; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; color: #64748b; }
.btn-save { background: #10b981; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-danger { background: #ef4444; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }

/* =========================================
   STYLE HALAMAN ADMIN
   ========================================= */
.page-container { padding: 0; font-family: 'Segoe UI', sans-serif; color: #334155; }

.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.header h1 { margin: 0; font-size: 1.8rem; color: #1e293b; }
.subtitle { color: #64748b; margin: 5px 0 0; }

/* CARD & TABLE */
.card { background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 15px 20px; text-align: left; border-bottom: 1px solid #f1f5f9; }
th { background-color: #f8fafc; font-weight: 600; color: #64748b; font-size: 0.9rem; }
td { color: #334155; }

.text-right { text-align: right; }
.text-center { text-align: center; color: #94a3b8; font-style: italic; }

/* Badge Status */
.badge { padding: 4px 10px; border-radius: 50px; font-size: 0.75rem; font-weight: 600; }
.badge.green { background: #dcfce7; color: #166534; }
.badge.red { background: #fee2e2; color: #991b1b; }
.badge.gray { background: #f1f5f9; color: #475569; }

/* Tombol */
.btn-add { background: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; }
.btn-recipe { background: #8b5cf6; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 5px; font-size: 0.85rem; }
.btn-edit { background: #f59e0b; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; margin-right: 5px; }
.btn-delete { background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; }

/* Form Styles */
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 0.9rem; color: #475569; }
.input-std { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem; }
.input-std:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

/* Modal Resep Khusus */
.large-modal { width: 550px; }
.highlight { color: #8b5cf6; font-weight: 800; }
.modal-subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 20px; margin-top: -10px; }

.recipe-list { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0; overflow: hidden; margin-bottom: 20px; }
.mini-table th { background: #f1f5f9; font-size: 0.85rem; padding: 10px 15px; }
.mini-table td { padding: 10px 15px; font-size: 0.9rem; border-bottom: 1px solid #e2e8f0; }
.mini-table tr:last-child td { border-bottom: none; }

.btn-small-danger { background: #ef4444; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }

hr { border: none; border-top: 1px dashed #cbd5e1; margin: 20px 0; }

.add-recipe-form label { font-size: 0.9rem; font-weight: 700; color: #334155; margin-bottom: 8px; display: block; }
.row { display: flex; gap: 10px; }
.flex-2 { flex: 2; }
.flex-1 { flex: 1; }
.btn-add-small { background: #10b981; color: white; border: none; width: 45px; border-radius: 6px; cursor: pointer; font-size: 1.2rem; font-weight: bold; }
</style>
