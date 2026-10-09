<script setup>
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";

const route = useRoute();
// Sebelum navigasi awal selesai (chunk lazy-load masih diunduh), tampilkan kerangka sementara
const ready = computed(() => route.matched.length > 0);
</script>

<template>
  <RouterView v-if="ready" />
  <main v-else class="flex min-h-screen flex-col items-center justify-center gap-2" data-testid="app-loading">
    <h1 class="text-xl font-extrabold text-indigo-700">Delcom Auction</h1>
    <p class="text-sm text-slate-600">Memuat aplikasi...</p>
  </main>
</template>