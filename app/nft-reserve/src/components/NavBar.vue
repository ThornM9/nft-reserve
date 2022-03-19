<template>
  <nav class="flex flex-row justify-center align-middle">
    <NavButton
      v-for="i in menu"
      :key="i.name"
      :title="i.name"
      :url="i.url"
      :class="{ active: path === i.url }"
    />
  </nav>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";
import NavButton from "@/components/NavButton.vue";

export default defineComponent({
  components: { NavButton },
  setup() {
    const route = useRoute();
    const path = computed(() => route.path);

    const menu = [
      { name: "/", url: "/" },
      { name: "Admin", url: "/admin" },
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
  @apply text-blue-600;
}
</style>
