<script setup>
import { LogIn, Lock, Mail } from "lucide-vue-next";
import { RouterLink, useRouter } from "vue-router";
import { useInput } from "../../../hooks/useInput.js";
import { isValidEmail, runWithDialog, showWarningDialog } from "../../../helpers/toolsHelper.js";
import { useAuthStore } from "../states/authStore.js";

const router = useRouter();
const auth = useAuthStore();
const { value: email, onChange: onEmail } = useInput("");
const { value: password, onChange: onPassword } = useInput("");

async function submit() {
  if (!email.value.trim() || !password.value) {
    await showWarningDialog("Email dan kata sandi wajib diisi.");
    return;
  }
  if (!isValidEmail(email.value.trim())) {
    await showWarningDialog("Format email tidak valid.");
    return;
  }
  await runWithDialog(() => auth.login(email.value.trim(), password.value), auth, () => router.push("/"));
}
</script>

<template>
  <div class="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
    <h1 class="text-2xl font-extrabold">Masuk Akun</h1>
    <p class="mt-1 text-sm text-slate-500">Silakan masuk untuk mulai mengikuti lelang.</p>

    <form class="mt-6 space-y-4" novalidate @submit.prevent="submit">
      <div>
        <label for="login-email-input" class="text-xs font-bold uppercase tracking-wide text-slate-500">Alamat Email</label>
        <div class="relative mt-1">
          <Mail class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            id="login-email-input"
            type="email"
            placeholder="nama@email.com"
            :value="email"
            class="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
            @input="onEmail"
          />
        </div>
      </div>
      <div>
        <label for="login-password-input" class="text-xs font-bold uppercase tracking-wide text-slate-500">Kata Sandi</label>
        <div class="relative mt-1">
          <Lock class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            id="login-password-input"
            type="password"
            placeholder="********"
            :value="password"
            class="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
            @input="onPassword"
          />
        </div>
      </div>
      <button
        id="login-submit-button"
        type="submit"
        :disabled="auth.isAuthLogin"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        <LogIn class="h-4 w-4" /> Masuk Sekarang
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-500">
      Belum punya akun?
      <RouterLink to="/auth/register" class="font-bold text-indigo-600">Daftar baru</RouterLink>
    </p>
  </div>
</template>
