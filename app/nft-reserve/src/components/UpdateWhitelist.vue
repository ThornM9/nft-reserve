<template>
  <div class="flex justify-center mt-10 text-white">
    <div class="card border-primary w-3/4">
      <h1 class="text-center mb-5 text-xl">
        <strong>Update Whitelist</strong>
      </h1>
      <form @submit.prevent="updateWhitelist" class="text-center">
        <div>
          <label for="whitelistAddress" class="mr-2">Address: </label>
          <input
            type="text"
            id="whitelistAddress"
            v-model="whitelistAddress"
            class="text-input focus:border-primary w-1/2 ml-2"
          />
        </div>
        <div class="my-4">
          <label>
            <input
              type="radio"
              class="invisible cursor-pointer"
              :value="true"
              v-model="type"
            />
            <span
              :style="[
                type
                  ? {
                      color: '#CB429F',
                      padding: '3px',
                      borderRadius: '3px',
                      fontSize: '1.1em',
                    }
                  : {},
              ]"
              >Creator</span
            >
          </label>
          <label>
            <input
              type="radio"
              class="invisible cursor-pointer"
              :value="false"
              v-model="type"
            />
            <span
              :style="[
                !type
                  ? {
                      color: '#CB429F',
                      padding: '3px',
                      borderRadius: '3px',
                      fontSize: '1.1em',
                    }
                  : {},
              ]"
              >Mint</span
            >
          </label>
        </div>
        <div>
          <label>
            <input
              type="radio"
              class="invisible cursor-pointer"
              value="add"
              v-model="addOrRemove"
            />
            <span
              :style="[
                addOrRemove === 'add'
                  ? {
                      color: '#CB429F',
                      padding: '3px',
                      borderRadius: '3px',
                      fontSize: '1.1em',
                    }
                  : {},
              ]"
              >Add</span
            >
          </label>
          <label>
            <input
              type="radio"
              class="invisible cursor-pointer"
              value="remove"
              v-model="addOrRemove"
            />
            <span
              :style="[
                addOrRemove === 'remove'
                  ? {
                      color: '#CB429F',
                      padding: '3px',
                      borderRadius: '3px',
                      fontSize: '1.1em',
                    }
                  : {},
              ]"
              >Remove</span
            >
          </label>
        </div>
        <button class="mt-5 outlined-btn border-primary" type="submit">
          Update Whitelist
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import useCluster from "@/composables/cluster";
import useWallet from "@/composables/wallet";
import { PublicKey } from "@solana/web3.js";
import { RESERVE_PROGRAM_ID } from "../lib/constants";
import { ReserveClient } from "../lib/reserve";

export default defineComponent({
  props: {
    reserve: { type: PublicKey, required: true },
  },
  setup(props, ctx) {
    const { wallet, getWallet } = useWallet();
    const { cluster, getConnection } = useCluster();

    watch([wallet, cluster], async () => {
      await onNewWallet();
    });

    onMounted(async () => {
      if (getWallet() && getConnection()) {
        await onNewWallet();
      }
      await refreshProofs();
    });

    let rc: ReserveClient;
    const onNewWallet = async () => {
      let reserveIdl = await (await fetch("reserve_idl.json")).json();
      rc = new ReserveClient(
        getConnection(),
        getWallet()! as any,
        reserveIdl,
        RESERVE_PROGRAM_ID
      );
    };

    const proofs = ref<PublicKey[]>([]);
    const whitelistAddress = ref<string>("");
    const type = ref<boolean>(true);
    const addOrRemove = ref<string>("add");

    const refreshProofs = async () => {
      proofs.value = await rc.findAllWhitelistProofs(props.reserve);
      // TODO display this somewhere
    };

    const updateWhitelist = async () => {
      if (addOrRemove.value === "add") {
        await rc.addToWhitelist(
          props.reserve,
          new PublicKey(whitelistAddress.value),
          type.value
        );
      } else {
        await rc.removeFromWhitelist(
          props.reserve,
          new PublicKey(whitelistAddress.value)
        );
      }
    };

    return {
      updateWhitelist,
      whitelistAddress,
      type,
      addOrRemove,
    };
  },
});
</script>
