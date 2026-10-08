<script setup>
import { CircleUser, Gavel, LayoutDashboard, Users } from "lucide-vue-next";
import { RouterLink, useRoute } from "vue-router";

defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["close"]);

const route = useRoute();

const items = [
  { label: "Dashboard Lelang", to: { path: "/" }, icon: LayoutDashboard, mine: false },
  { label: "Lelang Saya", to: { path: "/", query: { tab: "mine" } }, icon: Gavel, mine: true },
  { label: "Daftar Pengguna", to: { path: "/users" }, icon: Users, mine: false },
  { label: "Profil Saya", to: { path: "/profile" }, icon: CircleUser, mine: false },
];

const isActive = (item) => route.path === item.to.path && (route.query.tab === "mine") === item.mine;
</script>

<template>
  <div>
    <div
      v-if="open"
      class="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
      data-testid="sidebar-overlay"
      @click="emit('close')"
    ></div>
    <aside
      :class="[
        'fixed bottom-0 left-0 top-16 z-40 w-64 border-r border-slate-200 bg-white p-4 transition-transform md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      ]"
      data-testid="sidebar"
    >
      <nav class="space-y-1">
        <RouterLink
          v-for="item in items"
          :key="item.label"
          :to="item.to"
          :class="[
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold',
            isActive(item) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100',
          ]"
          @click="emit('close')"
        >
          <component :is="item.icon" class="h-5 w-5" />
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>
  </div>
</template>
