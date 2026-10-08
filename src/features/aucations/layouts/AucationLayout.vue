<script setup>
import { onMounted, ref } from "vue";
import { RouterView, useRouter } from "vue-router";
import { useAuthStore } from "../../auth/states/authStore.js";
import { useUsersStore } from "../../users/states/usersStore.js";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";

const router = useRouter();
const auth = useAuthStore();
const users = useUsersStore();
const sidebarOpen = ref(false);

onMounted(async () => {
  // Token kedaluwarsa / tidak valid -> keluar dan kembali ke halaman login
  if (!(await users.fetchProfile())) {
    auth.logout();
    await router.push("/auth/login");
  }
});
</script>

<template>
  <div class="min-h-screen">
    <NavbarComponent @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <SidebarComponent :open="sidebarOpen" @close="sidebarOpen = false" />
    <main class="pt-16 md:pl-64">
      <div class="p-4 md:p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>
