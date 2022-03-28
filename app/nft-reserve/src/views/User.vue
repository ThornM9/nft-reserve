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
    <Modal v-show="isModalVisible" @close="closeModal" v-if="currentReserve">
      <template v-slot:header>Reserve</template>

      <template v-slot:body>
        <div v-if="modalLoading" class="text-center">
          <div
            class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600"
            role="status"
          >
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div v-else>
          <p>Reserve address: {{ currentReserve.publicKey.toString() }}</p>
          <p>Whitelists:</p>
          <p>Your NFTs:</p>
          <NftGrid :nfts="whitelistedNfts" @selected="handleNftSelect" />
        </div>
      </template>

      <template v-slot:footer>
        <button type="button" @click="redeemNft" :disabled="selectedNft">
          Redeem Nft
        </button>
        <button
          type="button"
          class="bg-primary border-primary text-white rounded"
          @click="closeModal"
          aria-label="Close modal"
        >
          Done
        </button>
      </template>
    </Modal>
    <div class="flex justify-center mt-10 text-white">
      <div class="card border-primary w-3/4">
        <h1 class="text-center mb-5 text-xl">
          <strong>Select a reserve</strong>
        </h1>
        <div
          v-for="reserve in foundReserves"
          :key="reserve.publicKey.toString()"
        >
          <button type="button" class="btn" @click="showModal(reserve)">
            {{ reserve.publicKey.toString() }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch, ref } from "vue";
import useWallet from "@/composables/wallet";
import useCluster from "@/composables/cluster";
import { RESERVE_PROGRAM_ID } from "../lib/constants";
import { ReserveClient } from "../lib/reserve";
import Modal from "@/components/Modal.vue";
import NftGrid from "@/components/NftGrid.vue";
import { getNFTsByOwner } from "@/common/web3/NFTget";
import { PublicKey } from "@solana/web3.js";

export default defineComponent({
  components: {
    Modal,
    NftGrid,
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
    const userNfts = ref<any[]>([]);
    const proofs = ref<any>([]);
    const whitelistedNfts = ref<any[]>([]);
    const selectedNft = ref<any>(null);

    const isModalVisible = ref<boolean>(false);
    const modalLoading = ref<boolean>(true);

    let rc: ReserveClient;
    const onNewWallet = async () => {
      let reserveIdl = await (await fetch("reserve_idl.json")).json();
      rc = new ReserveClient(
        getConnection(),
        getWallet()! as any,
        reserveIdl,
        RESERVE_PROGRAM_ID
      );
      foundReserves.value = await rc.findAllReserves();
    };

    const showModal = (reserve: any) => {
      currentReserve.value = reserve;
      isModalVisible.value = true;
      modalLoading.value = true;
    };

    const closeModal = () => {
      isModalVisible.value = false;
      modalLoading.value = true;
    };

    const handleNftSelect = (e: any) => {
      if (e.selected) {
        selectedNft.value = e.nft;
      } else {
        selectedNft.value = null;
      }
    };

    const findAllUserNfts = async () => {
      if (getWallet()) {
        userNfts.value = await getNFTsByOwner(
          getWallet()!.publicKey!,
          getConnection()
        );
        console.log(userNfts.value);
      }
    };

    const filterWhitelistedNfts = () => {
      whitelistedNfts.value = [];
      selectedNft.value = null;
      for (const nft of userNfts.value) {
        let proven = false; // stops from adding same nft multiple times if it matches multiple proofs
        for (const proof of proofs.value) {
          if (proven) continue;

          let wlType = proof.account.whitelistType;
          let wlAddress = proof.account.whitelistedAddress.toString();
          let nftMint = nft.onchainMetadata.mint;
          let nftCreators = nft.onchainMetadata.data.creators.map(
            (x) => x.address
          );
          if (wlType) {
            // this is a creator wl
            for (const creatorAddress of nftCreators) {
              if (creatorAddress === wlAddress) {
                whitelistedNfts.value.push(nft);
                proven = true;
                break;
              }
            }
          } else {
            // this is a mint wl
            if (nftMint === wlAddress) {
              whitelistedNfts.value.push(nft);
              proven = true;
            }
          }
        }
      }
    };

    watch(currentReserve, async () => {
      await refreshNfts();
    });

    const refreshNfts = async () => {
      modalLoading.value = true;
      proofs.value = await rc.findAllWhitelistProofs(
        currentReserve.value.publicKey
      );
      await findAllUserNfts();

      // filter out the nfts that aren't whitelisted
      filterWhitelistedNfts();
      modalLoading.value = false;
    };

    const findCreatorAddrForNft = (nft) => {
      for (const proof of proofs.value) {
        let wlType = proof.account.whitelistType;
        let wlAddress = proof.account.whitelistedAddress.toString();
        let nftCreators = nft.onchainMetadata.data.creators.map(
          (x) => x.address
        );
        if (wlType) {
          // this is a creator wl
          for (const creatorAddress of nftCreators) {
            if (creatorAddress === wlAddress) {
              return new PublicKey(wlAddress);
            }
          }
        }
      }
      return new PublicKey(nft.onchainMetadata.data.creators[0].address);
    };

    const redeemNft = async () => {
      console.log("=========Redeeming an NFT=========");
      console.log("Selected NFT: ");
      console.log(selectedNft.value);
      console.log("Selected Reserve: ");
      console.log(currentReserve.value);
      await rc.redeemNft(
        currentReserve.value.account.tokenMint,
        currentReserve.value.account.treasuryAccount,
        currentReserve.value.publicKey,
        selectedNft.value.mint,
        selectedNft.value.pubkey!,
        findCreatorAddrForNft(selectedNft.value)
      );
      await refreshNfts();
    };

    return {
      wallet,
      foundReserves,
      currentReserve,
      isModalVisible,
      modalLoading,
      showModal,
      closeModal,
      handleNftSelect,
      whitelistedNfts,
      redeemNft,
    };
  },
});
</script>

<style scoped></style>
