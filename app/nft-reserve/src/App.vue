<template>
  <div class="relative h-full min-h-screen bg-blue-100">
    <NavBar />
    <div class="p-10">
      <router-view />
    </div>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar";
export default {
  components: { NavBar },
};
</script>
