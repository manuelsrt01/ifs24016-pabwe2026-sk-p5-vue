<script setup>
import { onBeforeUnmount, ref } from "vue";
import { Upload, X } from "lucide-vue-next";
import { runWithDialog, showWarningDialog } from "../../../helpers/toolsHelper.js";
import { useAucationsStore } from "../states/aucationsStore.js";

const props = defineProps({
  aucationId: { type: [String, Number], required: true },
});
const emit = defineEmits(["close", "success"]);

const store = useAucationsStore();
const file = ref(null);
const preview = ref("");

async function onFileChange(event) {
  const selected = event.target.files[0];
  if (!selected) return;
  if (!selected.type.startsWith("image/")) {
    await showWarningDialog("File harus berupa gambar.");
    return;
  }
  file.value = selected;
  preview.value = URL.createObjectURL(selected);
}

async function submit() {
  if (!file.value) {
    await showWarningDialog("Pilih gambar cover terlebih dahulu.");
    return;
  }
  await runWithDialog(() => store.changeCover(props.aucationId, file.value), store, () => emit("success"));
}

onBeforeUnmount(() => {
  if (preview.value) URL.revokeObjectURL(preview.value);
});
</script>

<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" data-testid="cover-modal">
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-extrabold">Ganti Cover</h2>
        <button type="button" aria-label="Tutup" class="rounded-lg p-1 hover:bg-slate-100" data-testid="modal-close" @click="emit('close')">
          <X class="h-5 w-5" />
        </button>
      </div>
      <form class="space-y-4" data-testid="cover-form" @submit.prevent="submit">
        <img v-if="preview" :src="preview" alt="Pratinjau cover" class="aspect-video w-full rounded-xl object-cover" data-testid="cover-preview" />
        <label for="cover-input" class="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-6 text-sm font-semibold text-slate-600 hover:border-indigo-400">
          <Upload class="h-4 w-4" /> Pilih gambar
        </label>
        <input id="cover-input" type="file" accept="image/*" class="hidden" data-testid="cover-input" @change="onFileChange" />
        <div class="flex justify-end gap-2">
          <button type="button" class="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-slate-100" @click="emit('close')">Batal</button>
          <button type="submit" :disabled="store.isAucationChangeCover" class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60">
            Unggah Cover
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
