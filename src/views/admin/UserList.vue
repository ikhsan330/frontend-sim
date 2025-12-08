<template>
  <div class="user-page">
    <div class="page-header">
      <h1>👥 Kelola Staff (Kasir & Dapur)</h1>
      <button @click="openModal()" class="btn-add">
        + Tambah Pegawai
      </button>
    </div>

    <!-- TABEL USER -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Lengkap</th>
            <th>Username</th>
            <th>Role</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="users.length === 0">
            <td colspan="5" class="text-center">Belum ada data pegawai.</td>
          </tr>
          <tr v-for="user in users" :key="user.id">
            <td>#{{ user.id }}</td>
            <td>{{ user.full_name }}</td>
            <td>{{ user.username }}</td>
            <td>
              <span :class="'badge ' + user.role">
                {{ user.role.toUpperCase() }}
              </span>
            </td>
            <td>
              <button @click="openModal(user)" class="btn-edit">✏️ Edit</button>
              <button @click="deleteUser(user.id)" class="btn-delete">🗑️ Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL POPUP (FORM INPUT) -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ isEditing ? 'Edit Pegawai' : 'Tambah Pegawai Baru' }}</h3>

        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input v-model="form.full_name" type="text" required placeholder="Nama asli pegawai" />
          </div>

          <div class="form-group">
            <label>Username</label>
            <input v-model="form.username" type="text" required placeholder="Username untuk login" />
          </div>

          <div class="form-group">
            <label>Role / Jabatan</label>
            <select v-model="form.role" required>
              <option value="cashier">Cashier (Kasir)</option>
              <option value="kitchen">Kitchen (Dapur)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input v-model="form.password" type="password" :required="!isEditing"
              :placeholder="isEditing ? 'Kosongkan jika tidak ingin ganti password' : 'Password login'" />
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-save">
              {{ isLoading ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../../api/axios'; // Pastikan path ini benar sesuai struktur folder Anda

// State Data
const users = ref([]);
const isLoading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);

// Form State
const form = ref({
  id: null,
  full_name: '',
  username: '',
  role: 'cashier',
  password: ''
});

// 1. FETCH DATA (GET)
const fetchUsers = async () => {
  try {
    const response = await apiClient.get('/admin/users');
    users.value = response.data;
  } catch (error) {
    console.error("Gagal ambil data user:", error);
    alert('Gagal mengambil data user.');
  }
};

// 2. SAVE DATA (POST / PUT)
const saveUser = async () => {
  isLoading.value = true;
  try {
    if (isEditing.value) {
      // EDIT MODE (PUT)
      // Kita kirim password hanya jika diisi user
      const payload = { ...form.value };
      if (!payload.password) delete payload.password;

      await apiClient.put(`/admin/users/${form.value.id}`, payload);
      alert('Data berhasil diperbarui!');
    } else {
      // ADD MODE (POST)
      await apiClient.post('/admin/users', form.value);
      alert('Pegawai baru berhasil ditambahkan!');
    }

    closeModal();
    fetchUsers(); // Refresh tabel

  } catch (error) {
    alert(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan.');
  } finally {
    isLoading.value = false;
  }
};

// 3. DELETE DATA
const deleteUser = async (id) => {
  if (!confirm('Yakin ingin menghapus pegawai ini? Data tidak bisa kembali.')) return;

  try {
    await apiClient.delete(`/admin/users/${id}`);
    alert('User berhasil dihapus.');
    fetchUsers();
  } catch (error) {
    console.error(error);
    alert('Gagal menghapus user.');
  }
};

// Helper Functions Modal
const openModal = (user = null) => {
  showModal.value = true;
  if (user) {
    // Mode Edit
    isEditing.value = true;
    form.value = {
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      role: user.role,
      password: '' // Reset password field
    };
  } else {
    // Mode Tambah
    isEditing.value = false;
    form.value = { id: null, full_name: '', username: '', role: 'cashier', password: '' };
  }
};

const closeModal = () => {
  showModal.value = false;
};

// Jalankan saat halaman dibuka
onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
/* Layout Dasar */
.user-page {
  font-family: Arial, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* Tabel */
.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

/* Badge Role */
.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}
.badge.cashier { background-color: #e3f2fd; color: #1976d2; }
.badge.kitchen { background-color: #fff3e0; color: #f57c00; }

/* Tombol */
button {
  cursor: pointer;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-weight: bold;
}

.btn-add { background-color: #42b983; color: white; }
.btn-edit { background-color: #f1c40f; color: white; margin-right: 5px; }
.btn-delete { background-color: #e74c3c; color: white; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box; /* Penting agar padding tidak melebarkan input */
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-save { background-color: #42b983; color: white; }
.btn-cancel { background-color: #ccc; color: black; }
</style>
