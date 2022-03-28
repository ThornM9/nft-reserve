<template>
  <div v-if="!wallet" class="text-white text-2xl text-center">
    Please connect wallet
  </div>
  <div v-else>
    <TestMint class="text-white" />
    <div class="flex justify-center mt-10 text-white">
      <div class="card border-primary w-1/2 text-center">
        <h1 class="text-center mb-5 text-xl">
          <strong>Create a New Reserve Treasury</strong>
        </h1>
        <form @submit.prevent="initReserve">
          <div>
            <label for="tokenMint">Treasury Token Mint</label>
            <input
              type="text"
              id="tokenMint"
              v-model="tokenMint"
              class="text-input focus:border-primary"
            />
          </div>
          <div>
            <label for="treasuryAccount"
              >Treasury Address (where purchased NFTs will be sent)</label
            >
            <input
              type="text"
              id="treasuryAccount"
              :disabled="burnNfts || sameTreasuryManager"
              v-model="treasuryAccount"
              class="text-input focus:border-primary"
            />
          </div>
          <div>
            <label for="repurchaseQuantity">NFT Purchase Price</label>
            <input
              type="text"
              id="repurchaseQuantity"
              v-model="repurchaseQuantity"
              class="text-input focus:border-primary"
            />
          </div>
          <div>
            <label for="burnCheckbox">Burn purchased tokens: &nbsp;</label>
            <input type="checkbox" id="burnCheckbox" v-model="burnNfts" />
          </div>
          <div>
            <label for="sameTreasuryManager"
              >Set treasury account to your address: &nbsp;</label
            >
            <input
              type="checkbox"
              id="sameTreasuryManager"
              v-model="sameTreasuryManager"
            />
          </div>
          <button class="mt-5 outlined-btn border-primary" type="submit">
            Create Reserve
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch, ref } from "vue";
import { PublicKey, Keypair } from "@solana/web3.js";
import { RESERVE_PROGRAM_ID } from "../lib/constants";
import { ReserveClient } from "../lib/reserve";
import TestMint from "@/components/TestMint.vue";
import useWallet from "@/composables/wallet";
import useCluster from "@/composables/cluster";

export default defineComponent({
  components: {
    TestMint,
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

    // reserve variables
    const tokenMint = ref<string>("");
    const repurchaseQuantity = ref<string>("");
    const burnNfts = ref<boolean>(false);
    const treasuryAccount = ref<string>("");
    const sameTreasuryManager = ref<boolean>(false);

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
      if (treasuryAccount.value !== "") {
        rc.initReserve(
          reserveAccount,
          new PublicKey(tokenMint.value),
          parseFloat(repurchaseQuantity.value),
          burnNfts.value,
          new PublicKey(treasuryAccount.value)
        );
      } else {
        rc.initReserve(
          reserveAccount,
          new PublicKey(tokenMint.value),
          parseFloat(repurchaseQuantity.value),
          burnNfts.value,
          new PublicKey(getWallet()!.publicKey!.toString())
        );
      }
    };

    watch(burnNfts, () => {
      if (burnNfts.value) {
        treasuryAccount.value = "";
      }
    });

    watch(sameTreasuryManager, () => {
      if (sameTreasuryManager.value) {
        treasuryAccount.value = getWallet()!.publicKey!.toString();
      }
    });

    return {
      wallet,
      initReserve,
      tokenMint,
      repurchaseQuantity,
      burnNfts,
      treasuryAccount,
      sameTreasuryManager,
    };
  },
});
</script>
