<template>
  <div>User</div>
  <ConfigPane />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import useWallet from "@/composables/wallet";
import useCluster from "@/composables/cluster";
import ConfigPane from "@/components/ConfigPane.vue";

export default defineComponent({
  components: { ConfigPane },
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
