<template>
  <div class="relative h-full min-h-screen bg-secondary">
    <NavBar />
    <div class="p-10">
      <router-view />
    </div>
  </div>
</template>

<style>
.card {
  @apply border-solid border-2 rounded-md p-4 pt-8 pb-8;
}

.outlined-btn {
  @apply bg-transparent text-white py-2 px-4 border rounded;
}
</style>

<script>
import NavBar from "@/components/NavBar";
export default {
  components: { NavBar },
};
</script>
