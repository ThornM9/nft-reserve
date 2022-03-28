<template>
  <div>
    <div class="flex justify-center h-full">
      <div class="mx-4 my-2">
        <select
          required
          id="cluster"
          v-model="chosenCluster"
          class="custom-select bg-secondary focus:bg-secondary border-primary text-pb"
        >
          <option :value="Cluster.Mainnet">Mainnet</option>
          <option :value="Cluster.Devnet">Devnet</option>
          <option :value="Cluster.Testnet">Testnet</option>
          <option :value="Cluster.Localnet">Localnet</option>
        </select>
      </div>
      <div class="mx-4 my-2">
        <select
          required
          id="wallet"
          v-model="chosenWallet"
          class="custom-select bg-secondary focus:bg-secondary border-primary text-pb text-center"
        >
          <option class="text-gray-500" :value="null">Choose wallet</option>
          <option :value="WalletName.Phantom">Phantom</option>
          <option :value="WalletName.Sollet">Sollet</option>
          <option :value="WalletName.Solflare">Solflare</option>
          <option :value="WalletName.SolflareWeb">Solflare Web</option>
        </select>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-select {
  @apply appearance-none block w-full px-3 py-1.5 text-base 
    font-normal bg-clip-padding bg-no-repeat border-2 border-solid 
    rounded transition ease-in-out m-0 focus:outline-none h-full;
}
</style>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { WalletName } from "@solana/wallet-adapter-wallets";
import useCluster, { Cluster } from "@/composables/cluster";
import useWallet from "@/composables/wallet";

export default defineComponent({
  setup() {
    // cluster
    const { cluster, setCluster, getClusterURL } = useCluster();
    const chosenCluster = computed({
      get() {
        return cluster.value;
      },
      set(newVal: Cluster) {
        setCluster(newVal);
      },
    });

    // wallet
    const { getWalletName, setWallet } = useWallet();
    const chosenWallet = computed({
      get() {
        return getWalletName();
      },
      set(newVal: WalletName | null) {
        setWallet(newVal, getClusterURL());
      },
    });

    return {
      Cluster,
      chosenCluster,
      WalletName,
      chosenWallet,
    };
  },
});
</script>
