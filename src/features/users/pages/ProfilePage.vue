<script setup>
import { computed, watch } from "vue";
import { Camera, KeyRound, Save } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput.js";
import { isValidEmail, runWithDialog, showWarningDialog } from "../../../helpers/toolsHelper.js";
import UserAvatar from "../../common/components/UserAvatar.vue";
import { useUsersStore } from "../states/usersStore.js";

const store = useUsersStore();
const { value: name, onChange: onName } = useInput("");
const { value: email, onChange: onEmail } = useInput("");
const { value: password, onChange: onPassword, reset: resetPassword } = useInput("");
const { value: newPassword, onChange: onNewPassword, reset: resetNewPassword } = useInput("");
const { value: confirmation, onChange: onConfirmation, reset: resetConfirmation } = useInput("");

const photo = computed(() => (store.profile ? store.profile.photo : ""));

watch(
  () => store.profile,
  (profile) => {
    if (profile) {
      name.value = profile.name;
      email.value = profile.email;
    }
  },
  { immediate: true },
);

async function saveProfile() {
  if (!name.value.trim() || !email.value.trim()) {
    await showWarningDialog("Nama dan email wajib diisi.");
    return;
  }
  if (!isValidEmail(email.value.trim())) {
    await showWarningDialog("Format email tidak valid.");
    return;
  }
  await runWithDialog(() => store.changeProfile(name.value.trim(), email.value.trim()), store, () => {});
}

async function onPhotoSelected(event) {
  const file = event.target.files[0];
  if (!file) return;
  await runWithDialog(() => store.changePhoto(file), store, () => {});
}

async function savePassword() {
  if (!password.value || !newPassword.value || !confirmation.value) {
    await showWarningDialog("Semua kolom kata sandi wajib diisi.");
    return;
  }
  if (newPassword.value.length < 6) {
    await showWarningDialog("Kata sandi baru minimal 6 karakter.");
    return;
  }
  if (newPassword.value !== confirmation.value) {
    await showWarningDialog("Konfirmasi kata sandi baru tidak sama.");
    return;
  }
  await runWithDialog(
    () => store.changePassword(password.value, newPassword.value, confirmation.value),
    store,
    () => {
      resetPassword();
      resetNewPassword();
      resetConfirmation();
    },
  );
}
</script>

<template>
  <section class="mx-auto max-w-2xl space-y-6">
    <h1 class="text-2xl font-extrabold">Profil Saya</h1>

    <div class="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <UserAvatar :photo="photo" :name="name" size-class="h-20 w-20 text-2xl" />
      <div>
        <label
          for="photo"
          class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold hover:bg-slate-200"
        >
          <Camera class="h-4 w-4" /> Ganti Foto
        </label>
        <input id="photo" type="file" accept="image/*" class="hidden" data-testid="photo-input" @change="onPhotoSelected" />
      </div>
    </div>

    <form class="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100" novalidate data-testid="profile-form" @submit.prevent="saveProfile">
      <h2 class="font-bold">Data Akun</h2>
      <div>
        <label for="name" class="text-xs font-bold uppercase text-slate-500">Nama</label>
        <input id="name" type="text" :value="name" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" @input="onName" />
      </div>
      <div>
        <label for="email" class="text-xs font-bold uppercase text-slate-500">Email</label>
        <input id="email" type="email" :value="email" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" @input="onEmail" />
      </div>
      <button type="submit" :disabled="store.isProfileChange" class="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
        <Save class="h-4 w-4" /> Simpan Profil
      </button>
    </form>

    <form class="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100" novalidate data-testid="password-form" @submit.prevent="savePassword">
      <h2 class="font-bold">Ubah Kata Sandi</h2>
      <div>
        <label for="password" class="text-xs font-bold uppercase text-slate-500">Kata Sandi Lama</label>
        <input id="password" type="password" :value="password" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" @input="onPassword" />
      </div>
      <div>
        <label for="new-password" class="text-xs font-bold uppercase text-slate-500">Kata Sandi Baru</label>
        <input id="new-password" type="password" :value="newPassword" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" @input="onNewPassword" />
      </div>
      <div>
        <label for="confirmation" class="text-xs font-bold uppercase text-slate-500">Konfirmasi Kata Sandi Baru</label>
        <input id="confirmation" type="password" :value="confirmation" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" @input="onConfirmation" />
      </div>
      <button type="submit" :disabled="store.isPasswordChange" class="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-60">
        <KeyRound class="h-4 w-4" /> Ubah Kata Sandi
      </button>
    </form>
  </section>
</template>
