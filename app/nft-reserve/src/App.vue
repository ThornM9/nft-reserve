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
  @apply bg-transparent text-white py-2 px-4 border-2 rounded;
}

.text-input {
  @apply bg-gray-200 appearance-none border-2 border-gray-200 
  rounded w-full py-2 px-4 text-gray-700 leading-tight 
  focus:outline-none focus:bg-white;
}
</style>

<script>
import NavBar from "@/components/NavBar";
export default {
  components: { NavBar },
};
</script>
