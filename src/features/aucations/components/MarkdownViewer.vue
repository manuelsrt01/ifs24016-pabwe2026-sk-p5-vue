<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";

const props = defineProps({
  content: { type: String, default: "" },
});

const root = ref(null);
let viewer = null;

onMounted(() => {
  viewer = Editor.factory({ el: root.value, viewer: true, initialValue: props.content });
});

watch(
  () => props.content,
  (value) => viewer.setMarkdown(value),
);

onBeforeUnmount(() => viewer.destroy());
</script>

<template>
  <div ref="root" data-testid="markdown-viewer"></div>
</template>