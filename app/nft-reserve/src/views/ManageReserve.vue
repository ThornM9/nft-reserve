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
            @change="refreshBal"
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
          <button class="outlined-btn border-primary" @click="refreshBal">
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
        <form @submit.prevent="fundReserve" class="text-center">
          <div>
            <label for="fundAmount" class="mr-2">Fund Amount: </label>
            <input
              type="text"
              id="fundAmount"
              v-model="fundAmount"
              class="text-input focus:border-primary w-1/2 ml-2"
            />
          </div>
          <button class="mt-5 outlined-btn border-primary" type="submit">
            Fund Reserve
          </button>
        </form>
      </div>
    </div>
    <UpdateWhitelist :reserve="currentReserve.publicKey" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch, ref } from "vue";
import { PublicKey, Keypair } from "@solana/web3.js";
import { RESERVE_PROGRAM_ID } from "../lib/constants";
import { ReserveClient } from "../lib/reserve";
import useWallet from "@/composables/wallet";
import useCluster from "@/composables/cluster";
import UpdateWhitelist from "@/components/UpdateWhitelist.vue";

export default defineComponent({
  components: {
    UpdateWhitelist,
  },
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
    const fundAmount = ref<string>("");

    let rc: ReserveClient;
    const onNewWallet = async () => {
      let reserveIdl = await (await fetch("reserve_idl.json")).json();
      rc = new ReserveClient(
        getConnection(),
        getWallet()! as any,
        reserveIdl,
        RESERVE_PROGRAM_ID
      );
      foundReserves.value = await rc.findAllReserves(getWallet()!.publicKey!);
      if (foundReserves.value.length) {
        currentReserve.value = foundReserves.value[0];
      }
      await updateReserveBalance();
    };

    const refreshBal = async () => {
      foundReserves.value = await rc.findAllReserves(getWallet()!.publicKey!);
      await updateReserveBalance();
    };

    const updateReserveBalance = async () => {
      tokensRemainingInReserve.value = "Loading...";
      const bal = await rc.getReserveBalance(
        currentReserve.value.publicKey,
        currentReserve.value.account.tokenMint
      );
      tokensRemainingInReserve.value = `${bal}`;
    };

    const fundReserve = async () => {
      await rc.fundReserve(
        currentReserve.value.publicKey,
        currentReserve.value.account.tokenMint,
        parseFloat(fundAmount.value)
      );
    };

    return {
      wallet,
      foundReserves,
      currentReserve,
      tokensRemainingInReserve,
      refreshBal,
      fundAmount,
      fundReserve,
    };
  },
});
</script>
