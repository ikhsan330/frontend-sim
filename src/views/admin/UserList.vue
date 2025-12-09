<template>
  <div class="user-page">

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
    <div class="page-header">
      <div>
        <h1>👥 Kelola Staff</h1>
        <p class="subtitle">Manajemen akun kasir dan staf dapur</p>
      </div>
      <button @click="openModal()" class="btn-add">
        + Tambah Pegawai
      </button>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Lengkap</th>
            <th>Username</th>
            <th>Role</th>
            <th class="text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="users.length === 0">
            <td colspan="5" class="text-center">Belum ada data pegawai.</td>
          </tr>
          <tr v-for="user in users" :key="user.id">
            <td>#{{ user.id }}</td>
            <td class="fw-bold">{{ user.full_name }}</td>
            <td>{{ user.username }}</td>
            <td>
              <span :class="'badge ' + user.role">
                {{ user.role === 'cashier' ? 'KASIR' : (user.role === 'kitchen' ? 'DAPUR' : user.role.toUpperCase()) }}
              </span>
            </td>
            <td class="text-right">
              <button @click="openModal(user)" class="btn-edit">✏️</button>
              <button @click="deleteUser(user.id)" class="btn-delete">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ isEditing ? 'Edit Pegawai' : 'Tambah Pegawai Baru' }}</h3>

        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input v-model="form.full_name" type="text" required placeholder="Nama asli pegawai" class="input-std" />
          </div>

          <div class="form-group">
            <label>Username</label>
            <input v-model="form.username" type="text" required placeholder="Username login" class="input-std" />
          </div>

          <div class="form-group">
            <label>Role / Jabatan</label>
            <select v-model="form.role" required class="input-std">
              <option value="cashier">Cashier (Kasir)</option>
              <option value="kitchen">Kitchen (Dapur)</option>
              <option value="admin">Admin (Manager)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input
              v-model="form.password"
              type="password"
              :required="!isEditing"
              :placeholder="isEditing ? 'Biarkan kosong jika tidak diganti' : 'Password login'"
              class="input-std"
            />
            <small v-if="isEditing" style="color: #666; font-size: 0.8rem;">
              * Isi hanya jika ingin mereset password user ini.
            </small>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-save">
              {{ isLoading ? 'Menyimpan...' : 'Simpan Data' }}
            </button>
          </div>
        </form>
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

// 1. FETCH DATA
const fetchUsers = async () => {
  try {
    const response = await apiClient.get('/admin/users');
    users.value = response.data;
  } catch (error) {
    console.error("Gagal ambil data user:", error);
    triggerAlert('Gagal mengambil data user.', 'danger');
  }
};

// 2. SAVE DATA
const saveUser = async () => {
  isLoading.value = true;
  try {
    if (isEditing.value) {
      const payload = { ...form.value };
      if (!payload.password) delete payload.password;

      await apiClient.put(`/admin/users/${form.value.id}`, payload);
      triggerAlert('Data pegawai diperbarui!', 'success');
    } else {
      await apiClient.post('/admin/users', form.value);
      triggerAlert('Pegawai baru ditambahkan!', 'success');
    }

    closeModal();
    fetchUsers();

  } catch (error) {
    triggerAlert(error.response?.data?.message || 'Gagal menyimpan.', 'danger');
  } finally {
    isLoading.value = false;
  }
};

// 3. DELETE DATA
const deleteUser = async (id) => {
  // Ganti confirm bawaan
  const confirmed = await useDialog(
    'Hapus Pegawai?',
    'Akun ini akan dihapus permanen dan tidak bisa login lagi.',
    'danger',
    'Hapus'
  );

  if (!confirmed) return;

  try {
    await apiClient.delete(`/admin/users/${id}`);
    triggerAlert('Akun berhasil dihapus.', 'success');
    fetchUsers();
  } catch (error) {
    triggerAlert(error.response?.data?.message,'Gagal menghapus user.', 'danger');
  }
};

// Helpers Modal
const openModal = (user = null) => {
  showModal.value = true;
  if (user) {
    isEditing.value = true;
    form.value = {
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      role: user.role,
      password: ''
    };
  } else {
    isEditing.value = false;
    form.value = { id: null, full_name: '', username: '', role: 'cashier', password: '' };
  }
};

const closeModal = () => showModal.value = false;

onMounted(fetchUsers);
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
.alert-warning { border: 2px solid #f59e0b; color: #92400e; background: #fffbeb; }

@keyframes slideDown {
  from { transform: translateX(-50%) translateY(-30px); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}

/* DIALOG STYLING */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.5); z-index: 10000;
  display: flex; justify-content: center; align-items: center;
  backdrop-filter: blur(2px);
}
.modal-content {
  background: white; padding: 25px; border-radius: 12px; width: 400px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}
.dialog-content { text-align: center; width: 350px; }
.dialog-content h3 { margin-top: 0; color: #1e293b; margin-bottom: 10px; }
.dialog-content p { color: #64748b; margin-bottom: 20px; line-height: 1.5; }

/* =========================================
   STYLE ADMIN PAGE
   ========================================= */
.user-page { padding: 0; font-family: 'Segoe UI', sans-serif; color: #334155; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.page-header h1 { margin: 0; font-size: 1.8rem; color: #1e293b; }
.subtitle { color: #64748b; margin: 5px 0 0; }

/* Tabel Modern */
.table-container { background: white; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 15px 20px; text-align: left; border-bottom: 1px solid #f1f5f9; }
th { background-color: #f8fafc; font-weight: 600; color: #64748b; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
td { color: #334155; }

.fw-bold { font-weight: 600; color: #1e293b; }
.text-right { text-align: right; }
.text-center { text-align: center; color: #94a3b8; font-style: italic; }

/* Badge Role */
.badge { padding: 5px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.badge.cashier { background-color: #e0f2fe; color: #0284c7; }
.badge.kitchen { background-color: #ffedd5; color: #c2410c; }
.badge.admin { background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }

/* Tombol Aksi */
.btn-add { background-color: #10b981; color: white; padding: 10px 20px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-add:hover { background-color: #059669; }

.btn-edit { background: #f59e0b; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; margin-right: 5px; }
.btn-delete { background: #ef4444; color: white; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
.btn-edit:hover, .btn-delete:hover { opacity: 0.9; }

/* Form Styles */
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 0.9rem; color: #475569; }
.input-std { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem; transition: 0.2s; }
.input-std:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; }
.btn-save { background-color: #10b981; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-cancel { background-color: #f1f5f9; color: #475569; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.btn-danger { background-color: #ef4444; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
</style>
