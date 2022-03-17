<template>
  <ConfigPane />
  <div>Admin</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from "vue";
import ConfigPane from "@/components/ConfigPane.vue";
import useWallet from "@/composables/wallet";
import useCluster from "@/composables/cluster";

export default defineComponent({
  components: {
    ConfigPane,
  },
  setup() {
    const { wallet, getWallet } = useWallet();
    const { cluster, getConnection } = useCluster();

    watch([wallet, cluster], async () => {
      console.log("wallet changed");
    });

    //needed in case we switch in from another window
    onMounted(async () => {
      if (getWallet() && getConnection()) {
        console.log("found wallet");
      }
    });

    return {
      wallet,
    };
  },
});
</script>

<style scoped></style>
