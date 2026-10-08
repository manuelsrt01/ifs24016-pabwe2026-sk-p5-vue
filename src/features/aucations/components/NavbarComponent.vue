<script setup>
import { computed } from "vue";
import { Gavel, LogOut, Menu } from "lucide-vue-next";
import { RouterLink, useRouter } from "vue-router";
import { showConfirmDialog } from "../../../helpers/toolsHelper.js";
import { useAuthStore } from "../../auth/states/authStore.js";
import UserAvatar from "../../common/components/UserAvatar.vue";
import { useUsersStore } from "../../users/states/usersStore.js";

const emit = defineEmits(["toggle-sidebar"]);

const router = useRouter();
const auth = useAuthStore();
const users = useUsersStore();

const displayName = computed(() => (users.profile ? users.profile.name : "Pengguna"));
const email = computed(() => (users.profile ? users.profile.email : ""));
const photo = computed(() => (users.profile ? users.profile.photo : ""));

async function onLogout() {
  if (!(await showConfirmDialog("Keluar dari akun?", "Sesi Anda akan diakhiri."))) return;
  auth.logout();
  await router.push("/auth/login");
}
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
    <div class="flex items-center gap-3">
      <button
        type="button"
        aria-label="Buka menu"
        class="rounded-lg p-2 hover:bg-slate-100 md:hidden"
        data-testid="menu-button"
        @click="emit('toggle-sidebar')"
      >
        <Menu class="h-5 w-5" />
      </button>
      <RouterLink to="/" class="flex items-center gap-2 font-extrabold text-indigo-700">
        <Gavel class="h-6 w-6" /> Delcom Auction
      </RouterLink>
    </div>

    <div class="flex items-center gap-3">
      <RouterLink
        :to="{ path: '/', query: { tab: 'mine' } }"
        class="hidden rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:block"
        data-testid="quick-mine"
      >
        Lelang Saya
      </RouterLink>
      <div class="flex items-center gap-2">
        <UserAvatar :photo="photo" :name="displayName" size-class="h-9 w-9" />
        <div class="hidden leading-tight sm:block">
          <p class="text-sm font-bold" data-testid="user-name">{{ displayName }}</p>
          <p class="text-xs text-slate-500" data-testid="user-email">{{ email }}</p>
        </div>
      </div>
      <button
        type="button"
        class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
        data-testid="logout-button"
        @click="onLogout"
      >
        <LogOut class="h-4 w-4" /> Keluar
      </button>
    </div>
  </header>
</template>
