<template>
  <div v-if="!wallet" class="text-white text-2xl text-center">
    Please connect wallet
  </div>
  <div v-else>Couldn't find any</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch, ref } from "vue";
import { PublicKey, Keypair } from "@solana/web3.js";
import { RESERVE_PROGRAM_ID } from "../lib/constants";
import { ReserveClient } from "../lib/reserve";
import useWallet from "@/composables/wallet";
import useCluster from "@/composables/cluster";

export default defineComponent({
  setup() {
    const { wallet, getWallet } = useWallet();
    const { cluster, getConnection } = useCluster();

    watch([wallet, cluster], async () => {
      console.log("wallet changed");
      await onNewWallet();
    });

    //needed in case we switch in from another window
    onMounted(async () => {
      if (getWallet() && getConnection()) {
        console.log("found wallet");
        await onNewWallet();
      }
    });

    const foundReserves = ref<any[]>([]);

    let rc: ReserveClient;
    const onNewWallet = async () => {
      let reserveIdl = await (await fetch("reserve_idl.json")).json();
      rc = new ReserveClient(
        getConnection(),
        getWallet()! as any,
        reserveIdl,
        RESERVE_PROGRAM_ID
      );
      await findReserves(getWallet()!.publicKey!);
    };

    const findReserves = async (manager: PublicKey) => {
      let res = await rc.findAllReserves(manager);
      console.log(res);
    };

    return {
      wallet,
    };
  },
});
</script>
