<template>
  <div>
    <p>New Reserve</p>
    <form @submit.prevent="initReserve">
      <div>
        <!-- <label for=" -->
      </div>
      <button class="mb-5" type="submit">Start farm*</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { enc } from "@/lib/utils";
import { PublicKey, Keypair } from "@solana/web3.js";
import { RESERVE_PROGRAM_ID } from "@/lib/constants";

export default defineComponent({
  setup() {
    console.log("hi");
  },
});
</script>
