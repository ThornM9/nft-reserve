<template>
  <div>User</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import useWallet from "@/composables/wallet";
import useCluster from "@/composables/cluster";

export default defineComponent({
  setup() {
    const { wallet, getWallet } = useWallet();
    const { cluster, getConnection } = useCluster();

    return {
      wallet,
    };
  },
});
</script>

<style scoped></style>
