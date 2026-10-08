<script setup>
import { computed } from "vue";
import { resolveAsset } from "../../../helpers/toolsHelper.js";

const props = defineProps({
  photo: { type: String, default: "" },
  name: { type: String, default: "" },
  sizeClass: { type: String, default: "h-10 w-10" },
});

const src = computed(() => resolveAsset(props.photo));
const initial = computed(() => props.name.charAt(0).toUpperCase());
</script>

<template>
  <img v-if="src" :src="src" :alt="name" :class="[sizeClass, 'rounded-full object-cover']" />
  <span
    v-else
    :class="[sizeClass, 'flex items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700']"
    data-testid="avatar-initial"
  >{{ initial }}</span>
</template>
