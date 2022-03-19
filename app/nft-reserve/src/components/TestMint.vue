<template>
  <div class="flex justify-center mt-10">
    <div class="card border-primary w-1/2 text-center">
      <h1 class="text-white text-center mb-5 text-xl">
        <strong>Create Test Reserve Token</strong>
      </h1>
      <button @click="createTestToken" class="outlined-btn border-primary">
        Create Test Mint
      </button>
      <div v-if="mint">
        <p class="my-2">
          🎉 New mint created and 1,000,000 tokens deposited into your wallet!
        </p>
        <p class="mb-5">Mint: {{ mint }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import useWallet from "@/composables/wallet";
import useCluster from "@/composables/cluster";
import { BrowserWallet } from "@gemworks/gem-farm-ts";

export default defineComponent({
  setup() {
    const { getWallet } = useWallet();
    const { getConnection } = useCluster();

    const mint = ref<string>();

    const createTestToken = async () => {
      const bw = new BrowserWallet(getConnection(), getWallet() as any);

      const { mint: rewardMint } = await bw.createMintAndFundATA(0, 1000000);
      mint.value = rewardMint.toBase58();
    };

    return {
      mint,
      createTestToken,
    };
  },
});
</script>

<style scoped></style>
