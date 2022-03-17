<template>
  <div class="relative h-full min-h-screen">
    <TheNavBar />
    <div class="p-10">
      <router-view />
    </div>
  </div>
</template>

<script>
import TheNavBar from "@/components/TheNavBar";
export default {
  components: { TheNavBar },
};
</script>
