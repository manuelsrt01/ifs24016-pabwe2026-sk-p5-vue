<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Clock, Eye, Image as ImageIcon, Plus, Search, Trash2 } from "lucide-vue-next";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  confirmAndRun,
  formatCountdown,
  formatRupiah,
  getHighestBid,
  isClosed,
  showErrorDialog,
} from "../../../helpers/toolsHelper.js";
import { useUsersStore } from "../../users/states/usersStore.js";
import AddModal from "../modals/AddModal.vue";
import { useAucationsStore } from "../states/aucationsStore.js";

// Perilaku nyata server (terverifikasi di aplikasi): is_closed=1 -> lelang ditutup, is_closed=0 -> lelang berlangsung.
const TABS = [
  { key: "all", label: "Semua Lelang", query: {} },
  { key: "mine", label: "Lelang Saya", query: { is_me: 1 } },
  { key: "open", label: "Lelang Berlangsung", query: { is_closed: 0 } },
  { key: "closed", label: "Lelang Ditutup", query: { is_closed: 1 } },
];
const TAB_KEYS = TABS.map((item) => item.key);

const route = useRoute();
const router = useRouter();
const store = useAucationsStore();
const users = useUsersStore();

const search = ref("");
const showAdd = ref(false);
const now = ref(Date.now());
let timer = null;

const tab = computed(() => (TAB_KEYS.includes(route.query.tab) ? route.query.tab : "all"));
const myId = computed(() => (users.profile ? users.profile.id : null));
const filtered = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  return store.aucations.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(keyword));
});

async function load() {
  const current = TABS.find((item) => item.key === tab.value);
  if (!(await store.fetchAucations(current.query))) await showErrorDialog(store.error);
}

const selectTab = (key) => router.push({ path: "/", query: { tab: key } });
const isMine = (item) => item.user_id === myId.value;
const highestOf = (item) => getHighestBid(item.bids);
const statusOf = (item) => formatCountdown(item.closed_at, now.value);
const closedOf = (item) => isClosed(item.closed_at, now.value);

const removeOne = (item) =>
  confirmAndRun("Hapus lelang?", `"${item.title}" akan dihapus permanen.`, () => store.removeAucation(item.id), store, load);

const removeAll = () =>
  confirmAndRun(
    "Hapus semua lelang saya?",
    "Seluruh lelang beserta cover dan tawarannya akan dihapus permanen.",
    () => store.removeAllAucations(),
    store,
    load,
  );

async function onAdded() {
  showAdd.value = false;
  await load();
}

watch(tab, load);

onMounted(() => {
  load();
  timer = setInterval(() => {
    now.value = Date.now();
  }, 30000);
});

onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-extrabold">Dashboard Lelang</h1>
        <p class="text-sm text-slate-500">Temukan barang, ajukan tawaran, atau pasang lelang milikmu.</p>
      </div>
      <div class="flex gap-2">
        <button
          v-if="tab === 'mine'"
          type="button"
          class="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-100"
          data-testid="delete-all-button"
          @click="removeAll"
        >
          <Trash2 class="h-4 w-4" /> Hapus Semua
        </button>
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
          data-testid="add-button"
          @click="showAdd = true"
        >
          <Plus class="h-4 w-4" /> Tambah Lelang
        </button>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="item in TABS"
        :key="item.key"
        type="button"
        :class="[
          'rounded-full px-4 py-1.5 text-sm font-semibold',
          tab === item.key ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100',
        ]"
        :data-testid="`tab-${item.key}`"
        @click="selectTab(item.key)"
      >
        {{ item.label }}
      </button>
    </div>

    <div class="relative max-w-md">
      <Search class="absolute left-3 top-3 h-4 w-4 text-slate-400" />
      <input
        v-model="search"
        type="search"
        placeholder="Cari judul atau deskripsi..."
        class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"
        data-testid="search-input"
      />
    </div>

    <p v-if="store.isAucation" class="text-slate-500" data-testid="loading">Memuat lelang...</p>
    <p v-else-if="filtered.length === 0" class="rounded-2xl bg-white p-8 text-center text-slate-500" data-testid="empty">
      Tidak ada lelang yang ditemukan.
    </p>
    <div v-else class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="item in filtered"
        :key="item.id"
        class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100"
        data-testid="aucation-card"
      >
        <div class="aspect-video bg-slate-100">
          <img v-if="item.cover" :src="item.cover" :alt="item.title" class="h-full w-full object-cover" />
          <div v-else class="flex h-full items-center justify-center text-slate-300" data-testid="no-cover">
            <ImageIcon class="h-10 w-10" />
          </div>
        </div>
        <div class="space-y-2 p-4">
          <span
            :class="[
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
              closedOf(item) ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700',
            ]"
            data-testid="status"
          >
            <Clock class="h-3 w-3" /> {{ statusOf(item) }}
          </span>
          <h3 class="truncate font-bold">{{ item.title }}</h3>
          <p class="text-xs text-slate-500">oleh {{ item.author.name }}</p>
          <div class="text-sm">
            <p>Harga awal: <strong>{{ formatRupiah(item.start_bid) }}</strong></p>
            <p v-if="highestOf(item) > 0" data-testid="highest">
              Tawaran tertinggi: <strong>{{ formatRupiah(highestOf(item)) }}</strong>
            </p>
            <p v-else data-testid="bid-count" class="text-slate-500">{{ item.bids.length }} tawaran</p>
          </div>
          <div class="flex gap-2 pt-1">
            <RouterLink
              :to="`/aucations/${item.id}`"
              class="flex flex-1 items-center justify-center gap-1 rounded-xl bg-indigo-50 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-100"
              data-testid="detail-link"
            >
              <Eye class="h-4 w-4" /> Detail
            </RouterLink>
            <button
              v-if="isMine(item)"
              type="button"
              class="rounded-xl bg-rose-50 px-3 text-rose-600 hover:bg-rose-100"
              aria-label="Hapus lelang"
              :data-testid="`delete-${item.id}`"
              @click="removeOne(item)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </article>
    </div>

    <AddModal v-if="showAdd" @close="showAdd = false" @success="onAdded" />
  </section>
</template>
