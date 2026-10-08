<script setup>
import { RouterView } from "vue-router";

// Path dari folder public/ (dibuat variabel agar tidak diproses sebagai impor aset)
const logoUrl = "/logo.svg";
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <section
      class="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 to-violet-700 p-12 text-white lg:flex"
      data-testid="auth-banner"
    >
      <div class="flex items-center gap-3">
        <img :src="logoUrl" alt="Logo Delcom Auction" class="h-10 w-10 rounded-xl" />
        <span class="text-xl font-extrabold">Delcom Auction</span>
      </div>
      <div class="space-y-4">
        <h2 class="text-4xl font-extrabold leading-tight">Tawar, menang, dan lelang barang impianmu.</h2>
        <p class="text-indigo-100">
          Platform lelang online modern: pasang barang, pantau tawaran tertinggi, dan tutup lelang tepat waktu.
        </p>
      </div>
      <p class="text-sm text-indigo-200">&copy; Delcom Auction</p>
    </section>
    <main class="flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        <RouterView />
      </div>
    </main>
  </div>
</template>