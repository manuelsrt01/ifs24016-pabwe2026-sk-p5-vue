<script setup>
import { X } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput.js";
import { formatRupiah, runWithDialog, showWarningDialog } from "../../../helpers/toolsHelper.js";
import { useAucationsStore } from "../states/aucationsStore.js";

const props = defineProps({
  aucationId: { type: [String, Number], required: true },
  currentPrice: { type: Number, required: true },
});
const emit = defineEmits(["close", "success"]);

const store = useAucationsStore();
const { value: bid, onChange: onBid } = useInput("");

async function submit() {
  const amount = Number(bid.value);
  // Nominal wajib lebih tinggi dari tawaran tertinggi saat ini (NaN / kosong juga ditolak)
  if (!(amount > props.currentPrice)) {
    await showWarningDialog(`Tawaran harus lebih tinggi dari ${formatRupiah(props.currentPrice)}.`);
    return;
  }
  await runWithDialog(() => store.addBid(props.aucationId, amount), store, () => emit("success"));
}
</script>

<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" data-testid="bid-modal">
    <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-extrabold">Ajukan Tawaran</h2>
        <button type="button" aria-label="Tutup" class="rounded-lg p-1 hover:bg-slate-100" data-testid="modal-close" @click="emit('close')">
          <X class="h-5 w-5" />
        </button>
      </div>
      <p class="mb-4 text-sm text-slate-600" data-testid="current-price">
        Tawaran tertinggi saat ini: <strong>{{ formatRupiah(currentPrice) }}</strong>
      </p>
      <form class="space-y-4" novalidate data-testid="bid-form" @submit.prevent="submit">
        <div>
          <label for="bid" class="text-xs font-bold uppercase text-slate-500">Nominal Tawaran (Rp)</label>
          <input id="bid" type="number" :value="bid" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" @input="onBid" />
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-100" @click="emit('close')">Batal</button>
          <button type="submit" :disabled="store.isBidAdd" class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
            Kirim Tawaran
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
