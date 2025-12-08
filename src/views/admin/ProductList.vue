<template>
  <div class="page-container">
    <div class="header">
      <h1>🍔 Master Produk (Menu)</h1>
      <button @click="openProductModal()" class="btn-add">+ Menu Baru</button>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Menu</th>
            <th>Kategori</th>
            <th>Harga</th>
            <th>Status</th>
            <th>Aksi / Resep</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prod in products" :key="prod.id">
            <td>
              <strong>{{ prod.name }}</strong>
            </td>
            <td>{{ prod.category }}</td>
            <td>Rp {{ formatPrice(prod.price) }}</td>
            <td>
              <span :class="prod.is_active ? 'active' : 'inactive'">
                {{ prod.is_active ? 'Aktif' : 'Non-Aktif' }}
              </span>
            </td>
            <td>
              <button @click="openRecipeModal(prod)" class="btn-recipe">🧪 Atur Resep</button>
              <button @click="openProductModal(prod)" class="btn-edit">✏️</button>
              <button @click="deleteProduct(prod.id)" class="btn-delete">🗑️</button>
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
            <input v-model="form.name" required />
          </div>
          <div class="form-group">
            <label>Kategori</label>
            <select v-model="form.category">
              <option value="Food">Makanan</option>
              <option value="Drink">Minuman</option>
              <option value="Snack">Snack</option>
            </select>
          </div>
          <div class="form-group">
            <label>Harga Jual (Rp)</label>
            <input v-model="form.price" type="number" required />
          </div>
          <div class="form-group">
            <label>Status Jual</label>
            <select v-model="form.is_active">
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
        <h3>🧪 Resep: {{ selectedProduct.name }}</h3>

        <div class="recipe-list">
          <table class="mini-table">
            <thead>
              <tr>
                <th>Bahan</th>
                <th>Takaran</th>
                <th>Hapus</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="currentRecipes.length === 0">
                <td colspan="3" class="text-center">Belum ada resep.</td>
              </tr>
              <tr v-for="r in currentRecipes" :key="r.recipe_id">
                <td>{{ r.ingredient_name }}</td>
                <td>{{ r.quantity }} {{ r.unit }}</td>
                <td>
                  <button @click="removeRecipeItem(r.recipe_id)" class="btn-small-danger">X</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr>

        <form @submit.prevent="addRecipeItem" class="add-recipe-form">
          <label>Tambah Bahan:</label>
          <div class="row">
            <select v-model="recipeForm.ingredient_id" required>
  <option disabled value="">Pilih Bahan...</option>
  <option v-for="ing in allIngredients" :key="ing.id" :value="ing.id">
    {{ ing.name }} (Satuan: {{ ing.unit }})  </option>
</select>
            <input v-model="recipeForm.quantity_needed" type="number" step="0.01" placeholder="Jml" required style="width: 80px;" />
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
    } else {
      await apiClient.post('/admin/products', form.value);
    }
    showProductModal.value = false;
    fetchProducts();
  } catch (err) { console.error(err); alert('Gagal menyimpan produk'); }
};

const deleteProduct = async (id) => {
  if (!confirm('Hapus menu ini?')) return;
  try {
    await apiClient.delete(`/admin/products/${id}`);
    fetchProducts();
  } catch (err) { console.error(err); alert('Gagal menghapus'); }
};

// 2. MANAJEMEN RESEP ========================
// Ambil daftar semua bahan baku untuk dropdown
const fetchAllIngredients = async () => {
  const res = await apiClient.get('/admin/ingredients');
  allIngredients.value = res.data;
};

// Buka Modal Resep & Ambil Resep Produk tsb
const openRecipeModal = async (product) => {
  selectedProduct.value = product;
  showRecipeModal.value = true;
  recipeForm.value = { ingredient_id: '', quantity_needed: '' }; // Reset form

  // Ambil data bahan (jika belum ada)
  if (allIngredients.value.length === 0) await fetchAllIngredients();

  // Ambil resep eksisting
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
    // Refresh tabel resep kecil
    refreshRecipeList(selectedProduct.value.id);
    recipeForm.value.quantity_needed = ''; // Reset jumlah
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menambah resep');
  }
};

const removeRecipeItem = async (recipeId) => {
  if(!confirm('Hapus bahan ini dari resep?')) return;
  try {
    await apiClient.delete(`/admin/recipes/${recipeId}`);
    refreshRecipeList(selectedProduct.value.id);
  } catch (err) { console.error(err); alert('Gagal hapus item'); }
};

// HELPER MODAL PRODUK
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

const formatPrice = (value) => {
  return new Intl.NumberFormat('id-ID').format(value);
}

onMounted(fetchProducts);
</script>

<style scoped>
/* Gunakan style dasar yang sama */
.page-container { padding: 0; }
.header { display: flex; justify-content: space-between; margin-bottom: 20px; }
.card { background: white; padding: 1px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
th { background: #f8f9fa; }

/* Status Badge */
.active { color: green; font-weight: bold; }
.inactive { color: red; font-weight: bold; }

/* Buttons */
button { cursor: pointer; padding: 6px 12px; border: none; border-radius: 4px; color: white; margin-right: 5px; }
.btn-add { background: #42b983; font-weight: bold; }
.btn-recipe { background: #3498db; } /* Biru untuk resep */
.btn-edit { background: #f39c12; }
.btn-delete { background: #e74c3c; }
.btn-save { background: #42b983; }
.btn-cancel { background: #ccc; color: black; }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-content { background: white; padding: 20px; border-radius: 8px; width: 400px; }
.large-modal { width: 500px; } /* Modal Resep agak lebar */

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
.form-group input, .form-group select { width: 100%; padding: 8px; box-sizing: border-box; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; }

/* Resep Mini Table */
.recipe-list { background: #f9f9f9; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
.mini-table th, .mini-table td { padding: 5px; font-size: 0.9em; }
.btn-small-danger { background: #e74c3c; padding: 2px 6px; font-size: 0.8em; }

/* Form Tambah Resep inline */
.add-recipe-form label { font-size: 0.9em; margin-bottom: 5px; display: block; }
.add-recipe-form .row { display: flex; gap: 5px; }
.btn-add-small { background: #27ae60; width: 40px; font-weight: bold; }
</style>
