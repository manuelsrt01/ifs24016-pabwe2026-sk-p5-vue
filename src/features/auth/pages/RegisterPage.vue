<script setup>
import { Lock, Mail, User, UserPlus } from "lucide-vue-next";
import { RouterLink, useRouter } from "vue-router";
import { useInput } from "../../../hooks/useInput.js";
import { isValidEmail, runWithDialog, showWarningDialog } from "../../../helpers/toolsHelper.js";
import { useAuthStore } from "../states/authStore.js";

const router = useRouter();
const auth = useAuthStore();
const { value: name, onChange: onName } = useInput("");
const { value: email, onChange: onEmail } = useInput("");
const { value: password, onChange: onPassword } = useInput("");
const { value: confirm, onChange: onConfirm } = useInput("");

async function submit() {
  if (!name.value.trim() || !email.value.trim() || !password.value) {
    await showWarningDialog("Nama, email, dan kata sandi wajib diisi.");
    return;
  }
  if (!isValidEmail(email.value.trim())) {
    await showWarningDialog("Format email tidak valid.");
    return;
  }
  if (password.value.length < 6) {
    await showWarningDialog("Kata sandi minimal 6 karakter.");
    return;
  }
  if (password.value !== confirm.value) {
    await showWarningDialog("Konfirmasi kata sandi tidak sama.");
    return;
  }
  await runWithDialog(
    () => auth.register(name.value.trim(), email.value.trim(), password.value),
    auth,
    () => router.push("/auth/login"),
  );
}
</script>

<template>
  <div class="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
    <h1 class="text-2xl font-extrabold">Daftar Baru</h1>
    <p class="mt-1 text-sm text-slate-500">Buat akun untuk mulai melelang dan menawar.</p>

    <form class="mt-6 space-y-4" novalidate @submit.prevent="submit">
      <div>
        <label for="name" class="text-xs font-bold uppercase tracking-wide text-slate-500">Nama Lengkap</label>
        <div class="relative mt-1">
          <User class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input id="name" type="text" placeholder="Nama Anda" :value="name"
            class="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
            @input="onName" />
        </div>
      </div>
      <div>
        <label for="email" class="text-xs font-bold uppercase tracking-wide text-slate-500">Alamat Email</label>
        <div class="relative mt-1">
          <Mail class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input id="email" type="email" placeholder="nama@email.com" :value="email"
            class="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
            @input="onEmail" />
        </div>
      </div>
      <div>
        <label for="password" class="text-xs font-bold uppercase tracking-wide text-slate-500">Kata Sandi</label>
        <div class="relative mt-1">
          <Lock class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input id="password" type="password" placeholder="Minimal 6 karakter" :value="password"
            class="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
            @input="onPassword" />
        </div>
      </div>
      <div>
        <label for="confirm" class="text-xs font-bold uppercase tracking-wide text-slate-500">Konfirmasi Kata Sandi</label>
        <div class="relative mt-1">
          <Lock class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input id="confirm" type="password" placeholder="Ulangi kata sandi" :value="confirm"
            class="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
            @input="onConfirm" />
        </div>
      </div>
      <button type="submit" :disabled="auth.isAuthRegister"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
        <UserPlus class="h-4 w-4" /> Daftar Sekarang
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Sudah punya akun?
      <RouterLink to="/auth/login" class="font-bold text-indigo-600">Masuk</RouterLink>
    </p>
  </div>
</template>
