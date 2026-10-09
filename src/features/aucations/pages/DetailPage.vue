<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { ArrowLeft, Camera, Gavel, Image as ImageIcon, Pencil, Trash2, Undo2 } from "lucide-vue-next";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  confirmAndRun,
  formatDate,
  formatRupiah,
  getHighestBid,
  isClosed,
  showErrorDialog,
} from "../../../helpers/toolsHelper.js";
import { useUsersStore } from "../../users/states/usersStore.js";
import MarkdownViewer from "../components/MarkdownViewer.vue";
import BidModal from "../modals/BidModal.vue";
import ChangeCoverModal from "../modals/ChangeCoverModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import { useAucationsStore } from "../states/aucationsStore.js";

const route = useRoute();
const router = useRouter();
const store = useAucationsStore();
const users = useUsersStore();

const showChange = ref(false);
const showCover = ref(false);
const showBid = ref(false);
const now = ref(Date.now());
let timer = null;

const aucationId = computed(() => route.params.aucationId);
const isOwner = computed(() => users.profile !== null && store.aucation.user_id === users.profile.id);
const closed = computed(() => isClosed(store.aucation.closed_at, now.value));
const highest = computed(() => getHighestBid(store.aucation.bids));
const currentPrice = computed(() => Math.max(store.aucation.start_bid, highest.value));
const history = computed(() => [...store.aucation.bids].sort((a, b) => b.bid - a.bid));
const hasMyBid = computed(() => Boolean(store.aucation.my_bid));
const canBid = computed(() => !isOwner.value && !closed.value);
const canCancelBid = computed(() => canBid.value && hasMyBid.value);
const isMyBid = (item) => hasMyBid.value && item.id === store.aucation.my_bid.id;

async function load() {
  store.aucation = null;
  if (!(await store.fetchAucation(aucationId.value))) await showErrorDialog(store.error);
}

const removeThis = () =>
  confirmAndRun(
    "Hapus lelang?",
    "Lelang ini akan dihapus permanen.",
    () => store.removeAucation(aucationId.value),
    store,
    () => router.push("/"),
  );

const cancelBid = () =>
  confirmAndRun(
    "Batalkan tawaran?",
    "Tawaran Anda pada lelang ini akan dihapus.",
    () => store.removeBid(aucationId.value),
    store,
    load,
  );

async function onModalSuccess() {
  showChange.value = false;
  showCover.value = false;
  showBid.value = false;
  await load();
}

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
    <RouterLink to="/" class="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
      <ArrowLeft class="h-4 w-4" /> Kembali ke dashboard
    </RouterLink>

    <p v-if="store.isAucation" class="text-slate-500" data-testid="loading">Memuat detail lelang...</p>

    <div v-else-if="store.aucation" class="grid gap-6 lg:grid-cols-2">
      <div class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <img v-if="store.aucation.cover" :src="store.aucation.cover" :alt="store.aucation.title" class="aspect-video w-full object-cover" data-testid="cover" />
        <div v-else class="flex aspect-video items-center justify-center bg-slate-100 text-slate-300" data-testid="no-cover">
          <ImageIcon class="h-16 w-16" />
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <span
            :class="['rounded-full px-3 py-1 text-xs font-bold', closed ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700']"
            data-testid="status"
          >
            {{ closed ? "Ditutup" : "Berlangsung" }}
          </span>
        </div>
        <h1 class="text-3xl font-extrabold" data-testid="title">{{ store.aucation.title }}</h1>
        <p class="text-sm text-slate-500">Dilelang oleh {{ store.aucation.author.name }}</p>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-xl bg-white p-3 ring-1 ring-slate-100">
            <p class="text-xs text-slate-500">Harga awal</p>
            <p class="font-bold" data-testid="start-bid">{{ formatRupiah(store.aucation.start_bid) }}</p>
          </div>
          <div class="rounded-xl bg-white p-3 ring-1 ring-slate-100">
            <p class="text-xs text-slate-500">Tawaran tertinggi</p>
            <p class="font-bold" data-testid="highest-bid">{{ formatRupiah(currentPrice) }}</p>
          </div>
          <div class="col-span-2 rounded-xl bg-white p-3 ring-1 ring-slate-100">
            <p class="text-xs text-slate-500">Ditutup pada</p>
            <p class="font-bold" data-testid="closed-at">{{ formatDate(store.aucation.closed_at) }}</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <template v-if="isOwner">
            <button type="button" class="flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700" data-testid="edit-button" @click="showChange = true">
              <Pencil class="h-4 w-4" /> Ubah
            </button>
            <button type="button" class="flex items-center gap-1 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold hover:bg-slate-200" data-testid="cover-button" @click="showCover = true">
              <Camera class="h-4 w-4" /> Ganti Cover
            </button>
            <button type="button" class="flex items-center gap-1 rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-100" data-testid="delete-button" @click="removeThis">
              <Trash2 class="h-4 w-4" /> Hapus
            </button>
          </template>
          <button v-if="canBid" type="button" class="flex items-center gap-1 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800" data-testid="bid-button" @click="showBid = true">
            <Gavel class="h-4 w-4" /> Ajukan Tawaran
          </button>
          <button v-if="canCancelBid" type="button" class="flex items-center gap-1 rounded-xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-100" data-testid="cancel-bid-button" @click="cancelBid">
            <Undo2 class="h-4 w-4" /> Batalkan Tawaran Saya
          </button>
        </div>
      </div>

      <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 class="mb-3 font-bold">Deskripsi</h2>
        <MarkdownViewer :content="store.aucation.description" />
      </div>

      <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 class="mb-3 font-bold">Riwayat Tawaran</h2>
        <p v-if="history.length === 0" class="text-sm text-slate-500" data-testid="no-bids">Belum ada tawaran.</p>
        <ul v-else class="divide-y divide-slate-100">
          <li v-for="item in history" :key="item.id" class="flex items-center justify-between py-2 text-sm" data-testid="bid-item">
            <span class="font-bold">{{ formatRupiah(item.bid) }}</span>
            <span class="flex items-center gap-2 text-slate-500">
              <span v-if="isMyBid(item)" class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700" data-testid="my-bid-badge">Tawaran Anda</span>
              {{ formatDate(item.created_at) }}
            </span>
          </li>
        </ul>
      </div>
    </div>

    <p v-else class="rounded-2xl bg-white p-8 text-center text-slate-500" data-testid="not-found">Lelang tidak ditemukan.</p>

    <ChangeModal v-if="showChange" :aucation="store.aucation" @close="showChange = false" @success="onModalSuccess" />
    <ChangeCoverModal v-if="showCover" :aucation-id="aucationId" @close="showCover = false" @success="onModalSuccess" />
    <BidModal v-if="showBid" :aucation-id="aucationId" :current-price="currentPrice" @close="showBid = false" @success="onModalSuccess" />
  </section>
</template>
