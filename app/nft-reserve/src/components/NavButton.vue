<template>
  <router-link :to="url" class="nav-button">
    {{ title }}
  </router-link>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    title: String,
    url: String,
  },
  setup() {
    return {};
  },
});
</script>

<style scoped>
.nav-button {
  @apply px-10 py-3 text-gray-300
  hover:text-white;
  outline: none;
}
</style>
