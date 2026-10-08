<script setup>
import { ref } from "vue";
import { X } from "lucide-vue-next";
import { useInput } from "../../../hooks/useInput.js";
import {
  runWithDialog,
  showWarningDialog,
  toApiDateTime,
  validateAucationForm,
} from "../../../helpers/toolsHelper.js";
import MarkdownEditor from "../components/MarkdownEditor.vue";
import { useAucationsStore } from "../states/aucationsStore.js";

const emit = defineEmits(["close", "success"]);

const store = useAucationsStore();
const { value: title, onChange: onTitle } = useInput("");
const { value: startBid, onChange: onStartBid } = useInput("");
const { value: closedAt, onChange: onClosedAt } = useInput("");
const description = ref("");

async function submit() {
  const message = validateAucationForm(
    { title: title.value, description: description.value, startBid: startBid.value, closedAt: closedAt.value },
    Date.now(),
  );
  if (message) {
    await showWarningDialog(message);
    return;
  }
  await runWithDialog(
    () =>
      store.addAucation({
        title: title.value.trim(),
        description: description.value,
        start_bid: Number(startBid.value),
        closed_at: toApiDateTime(closedAt.value),
      }),
    store,
    () => emit("success"),
  );
}
</script>

<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" data-testid="add-modal">
    <div class="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-extrabold">Tambah Lelang Baru</h2>
        <button type="button" aria-label="Tutup" class="rounded-lg p-1 hover:bg-slate-100" data-testid="modal-close" @click="emit('close')">
          <X class="h-5 w-5" />
        </button>
      </div>
      <form class="space-y-4" novalidate data-testid="add-form" @submit.prevent="submit">
        <div>
          <label for="add-title" class="text-xs font-bold uppercase text-slate-500">Judul</label>
          <input id="add-title" type="text" :value="title" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" @input="onTitle" />
        </div>
        <div>
          <span class="text-xs font-bold uppercase text-slate-500">Deskripsi</span>
          <div class="mt-1">
            <MarkdownEditor v-model="description" />
          </div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="add-start-bid" class="text-xs font-bold uppercase text-slate-500">Harga Awal (Rp)</label>
            <input id="add-start-bid" type="number" min="1" :value="startBid" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" @input="onStartBid" />
          </div>
          <div>
            <label for="add-closed-at" class="text-xs font-bold uppercase text-slate-500">Ditutup Pada</label>
            <input id="add-closed-at" type="datetime-local" :value="closedAt" class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" @input="onClosedAt" />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-100" @click="emit('close')">Batal</button>
          <button type="submit" :disabled="store.isAucationAdd" class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
            Simpan Lelang
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
