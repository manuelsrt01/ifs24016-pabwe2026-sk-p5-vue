<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

const props = defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "Tulis deskripsi barang..." },
  height: { type: String, default: "260px" },
});
const emit = defineEmits(["update:modelValue"]);

const root = ref(null);
let editor = null;

onMounted(() => {
  editor = new Editor({
    el: root.value,
    initialValue: props.modelValue,
    initialEditType: "wysiwyg",
    previewStyle: "vertical",
    height: props.height,
    placeholder: props.placeholder,
    usageStatistics: false,
    events: {
      change: () => emit("update:modelValue", editor.getMarkdown()),
    },
  });
});

onBeforeUnmount(() => editor.destroy());
</script>

<template>
  <div ref="root" data-testid="markdown-editor"></div>
</template>
