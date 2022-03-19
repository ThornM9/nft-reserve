<template>
  <nav class="flex flex-row justify-center align-middle">
    <NavButton
      v-for="i in menu"
      :key="i.name"
      :title="i.name"
      :url="i.url"
      :class="{ active: path === i.url }"
    />
    <ConfigPane />
  </nav>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import NavButton from "@/components/NavButton.vue";
import ConfigPane from "@/components/ConfigPane.vue";

export default defineComponent({
  components: { NavButton, ConfigPane },
  setup() {
    const route = useRoute();
    const path = computed(() => route.path);

    const menu = [
      { name: "/", url: "/" },
      { name: "Create", url: "/create" },
      { name: "Manage", url: "/manage" },
      { name: "User", url: "/user" },
    ];

    return {
      menu,
      path,
    };
  },
});
</script>

<style scoped>
.active {
  @apply text-white;
}
</style>
