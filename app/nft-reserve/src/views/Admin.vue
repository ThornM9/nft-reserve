<template>
  <div>Admin</div>
  <ConfigPane />
  <div v-if="!wallet">Please connect wallet</div>
  <div v-else>
    <!-- <div class="flex mb-10 w-full justify-center">
      <button class="is-primary mr-5" @click="showNewFarm = !showNewFarm">
        New farm
      </button>
      <button @click="refreshFarms">Refetch farms</button>
    </div> -->
    <div>
      <p>New Reserve</p>
      <form @submit.prevent="initReserve">
        <div>
          <!-- <label for=" -->
        </div>
        <button class="mb-5" type="submit">Create Reserve</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch, ref } from "vue";
import { PublicKey, Keypair } from "@solana/web3.js";
import { RESERVE_PROGRAM_ID } from "../lib/constants";
import { ReserveClient } from "../lib/reserve";
import ConfigPane from "@/components/ConfigPane.vue";
import InitReserve from "@/components/InitReserve.vue";
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
      await newWallet();
    });

    //needed in case we switch in from another window
    onMounted(async () => {
      if (getWallet() && getConnection()) {
        console.log("found wallet");
        await newWallet();
      }
    });

    let rc: ReserveClient;
    const newWallet = async () => {
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

    const initReserve = async () => {
      let reserveAccount = Keypair.generate();
      rc.initReserve(
        reserveAccount,
        new PublicKey("75nwSeTyY86fu1Ttp1dGv7W9XSnYrLirLCXUmC8qkCPa"),
        10
      );

      console.log("tm1");
    };
    return {
      wallet,
      initReserve,
    };
  },
});
</script>

<style scoped></style>
