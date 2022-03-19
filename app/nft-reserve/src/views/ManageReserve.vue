<template>
  <div v-if="!wallet" class="text-white text-2xl text-center">
    Please connect wallet
  </div>
  <div
    v-else-if="!foundReserves.length"
    class="text-white text-2xl text-center"
  >
    No reserves found.
    <router-link to="/create" class="text-primary"
      >Create a new reserve</router-link
    >
  </div>
  <div v-else class="text-white">
    <div class="flex justify-center mt-10 text-white">
      <div class="card border-primary w-3/4">
        <h1 class="text-center mb-5 text-xl">
          <strong>Reserve Info</strong>
        </h1>
        <div>
          <span class="w-1/4 mr-4">Choose a reserve:</span>
          <select
            required
            id="select-reserve"
            v-model="currentReserve"
            class="select bg-secondary focus:bg-secondary form-select border-white text-white w-3/4"
          >
            <option
              v-for="elem in foundReserves"
              :key="elem.publicKey.toString()"
              :value="elem"
            >
              {{ elem.publicKey.toString() }}
            </option>
          </select>
        </div>
        <p>
          Reserve manager: &nbsp;&nbsp;{{
            currentReserve.account.manager.toString()
          }}
        </p>
        <p>
          Purchasing token mint: &nbsp;&nbsp;{{
            currentReserve.account.tokenMint.toString()
          }}
        </p>
        <p>
          Purchasing price: &nbsp;&nbsp;
          {{ currentReserve.account.repurchaseQuantity.toNumber() }}
        </p>
        <p>
          NFTs purchased so far: &nbsp;&nbsp;
          {{ currentReserve.account.redeemCount.toNumber() }}
        </p>
        <p>
          Tokens remaining in reserve: &nbsp;&nbsp;
          {{ tokensRemainingInReserve }}
        </p>
        <div class="text-center mt-6">
          <button class="outlined-btn border-primary" @click="onNewWallet">
            Refresh Reserve Info
          </button>
        </div>
      </div>
    </div>
    <div class="flex justify-center mt-10 text-white">
      <div class="card border-primary w-3/4">
        <h1 class="text-center mb-5 text-xl">
          <strong>Fund Reserve</strong>
        </h1>
      </div>
    </div>
  </div>
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
    const currentReserve = ref<any>();
    const tokensRemainingInReserve = ref<string>("Loading");

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
      tokensRemainingInReserve.value = "Loading...";
      const bal = await rc.getReserveBalance(
        currentReserve.value.publicKey,
        currentReserve.value.account.tokenMint
      );
      tokensRemainingInReserve.value = `${bal}`;
    };

    const findReserves = async (manager: PublicKey) => {
      foundReserves.value = await rc.findAllReserves(manager);
      if (foundReserves.value.length) {
        currentReserve.value = foundReserves.value[0];
      }
    };

    return {
      wallet,
      foundReserves,
      currentReserve,
      tokensRemainingInReserve,
      onNewWallet,
    };
  },
});
</script>
