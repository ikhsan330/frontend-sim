<template>
  <div class="page-container">
    <div class="header">
      <div>
        <h1>📦 Master Bahan Baku (Gudang)</h1>
        <p style="color: #666; margin: 5px 0 0;">Atur satuan beli dan satuan pakai untuk resep.</p>
      </div>
      <button @click="openModal()" class="btn-add">+ Bahan Baru</button>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr>
            <th>Nama Bahan</th>
            <th>Satuan Resep</th>
            <th>Satuan Beli</th>
            <th>Konversi</th>
            <th>Stok (Unit Resep)</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="ingredients.length === 0">
            <td colspan="6" class="text-center">Belum ada bahan baku.</td>
          </tr>
          <tr v-for="item in ingredients" :key="item.id">
            <td class="fw-bold">{{ item.name }}</td>
            <td><span class="badge blue">{{ item.unit }}</span></td>
            <td><span class="badge green">{{ item.purchase_unit }}</span></td>
            <td class="text-small">1 {{ item.purchase_unit }} = {{ formatNum(item.conversion_rate) }} {{ item.unit }}</td>
            <td :class="{'text-danger': item.stock < 5}">{{ formatNum(item.stock) }} {{ item.unit }}</td>
            <td>
              <button @click="openModal(item)" class="btn-edit">✏️</button>
              <button @click="deleteIngredient(item.id)" class="btn-delete">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ isEditing ? 'Edit Bahan' : 'Tambah Bahan Baru' }}</h3>

        <form @submit.prevent="saveIngredient">
          <div class="form-group">
            <label>Nama Bahan</label>
            <input v-model="form.name" type="text" required placeholder="Contoh: Tepung Terigu, Minyak Goreng" class="input-std" />
          </div>

          <div class="conversion-box">
            <div class="box-section">
              <label>Satuan Dasar (Resep)</label>
              <select v-model="form.unit" required class="input-std">
                <option disabled value="">Pilih Satuan...</option>
                <optgroup label="Berat">
                  <option value="gr">Gram (gr)</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="ons">Ons</option>
                </optgroup>
                <optgroup label="Volume">
                  <option value="ml">MiliLiter (ml)</option>
                  <option value="liter">Liter (L)</option>
                  <option value="cc">CC</option>
                </optgroup>
                <optgroup label="Hitungan">
                  <option value="pcs">Pcs / Buah</option>
                  <option value="butir">Butir</option>
                  <option value="siung">Siung</option>
                  <option value="sdm">Sendok Makan</option>
                </optgroup>
              </select>
              <small>Dipakai koki saat masak.</small>
            </div>

            <div class="box-divider">⬇️</div>

            <div class="box-section highlight">
              <label>Satuan Pembelian (Gudang)</label>
              <div class="row-flex">
                <input v-model="form.purchase_unit" placeholder="Cth: Karung, Dus" required class="input-std flex-1" />
                <input v-model="form.conversion_rate" type="number" step="0.01" required class="input-std flex-1" placeholder="Isi..." />
              </div>
              <small>
                Rumus: 1 <b>{{ form.purchase_unit || '...' }}</b> berisi <b>{{ form.conversion_rate || '...' }}</b> {{ form.unit || '...' }}
              </small>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showModal = false" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-save">Simpan Data</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../../api/axios';

const ingredients = ref([]);
const showModal = ref(false);
const isEditing = ref(false);

// Form Default State
const form = ref({
  id: null,
  name: '',
  unit: 'gr',           // Default Gram
  purchase_unit: 'kg',  // Default Kg
  conversion_rate: 1000 // 1 Kg = 1000 Gr
});

// FETCH DATA
const fetchIngredients = async () => {
  try {
    const res = await apiClient.get('/admin/ingredients');
    ingredients.value = res.data;
  } catch (err) { console.error(err); }
};

// SAVE DATA
const saveIngredient = async () => {
  try {
    if (isEditing.value) {
      await apiClient.put(`/admin/ingredients/${form.value.id}`, form.value);
    } else {
      await apiClient.post('/admin/ingredients', form.value);
    }
    showModal.value = false;
    fetchIngredients();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menyimpan');
  }
};

// DELETE DATA
const deleteIngredient = async (id) => {
  if (!confirm('Hapus bahan ini?')) return;
  try {
    await apiClient.delete(`/admin/ingredients/${id}`);
    fetchIngredients();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus');
  }
};

// HELPERS
const openModal = (item = null) => {
  showModal.value = true;
  if (item) {
    isEditing.value = true;
    form.value = { ...item };
  } else {
    isEditing.value = false;
    // Reset form ke default yang masuk akal
    form.value = { id: null, name: '', unit: 'gr', purchase_unit: 'kg', conversion_rate: 1000 };
  }
};

const formatNum = (val) => new Intl.NumberFormat('id-ID').format(val);

onMounted(fetchIngredients);
</script>

<style scoped>
.page-container { padding: 20px; font-family: 'Segoe UI', sans-serif; color: #2c3e50; }
.header { display: flex; justify-content: space-between; margin-bottom: 25px; align-items: flex-start; }
.header h1 { margin: 0; font-size: 1.8rem; }

.card { background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 15px; border-bottom: 1px solid #f1f5f9; text-align: left; }
th { background: #f8fafc; font-weight: 600; color: #64748b; font-size: 0.9rem; }
.text-center { text-align: center; color: #94a3b8; font-style: italic; }
.fw-bold { font-weight: 700; }
.text-small { font-size: 0.85rem; color: #64748b; }
.text-danger { color: #ef4444; font-weight: bold; }

/* Badges */
.badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
.badge.blue { background: #e0f2fe; color: #0284c7; }
.badge.green { background: #dcfce7; color: #16a34a; }

/* Buttons */
button { cursor: pointer; border: none; border-radius: 6px; font-weight: 600; transition: 0.2s; }
.btn-add { background: #3b82f6; color: white; padding: 10px 20px; }
.btn-add:hover { background: #2563eb; }
.btn-edit { background: #f59e0b; color: white; padding: 6px 10px; margin-right: 5px; }
.btn-delete { background: #ef4444; color: white; padding: 6px 10px; }

/* MODAL & FORM STYLING */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 999; backdrop-filter: blur(2px); }
.modal-content { background: white; padding: 30px; border-radius: 12px; width: 450px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
.modal-content h3 { margin-top: 0; margin-bottom: 20px; color: #1e293b; }

.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 0.9rem; }
.input-std { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem; }
.input-std:focus { outline: none; border-color: #3b82f6; ring: 2px solid #3b82f6; }

/* Conversion Box Style */
.conversion-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
.box-section label { font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 5px; font-weight: 600; }
.box-section small { font-size: 0.8rem; color: #94a3b8; display: block; margin-top: 5px; }
.box-section.highlight { background: #f0fdf4; border: 1px dashed #22c55e; padding: 10px; border-radius: 6px; margin-top: 5px; }
.box-section.highlight label { color: #15803d; }
.box-section.highlight small { color: #166534; }
.box-divider { text-align: center; font-size: 1.2rem; margin: 5px 0; color: #cbd5e1; }

.row-flex { display: flex; gap: 10px; }
.flex-1 { flex: 1; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; }
.btn-save { background: #22c55e; color: white; padding: 10px 20px; }
.btn-save:hover { background: #16a34a; }
.btn-cancel { background: #e2e8f0; color: #475569; padding: 10px 20px; }
.btn-cancel:hover { background: #cbd5e1; }
</style>
