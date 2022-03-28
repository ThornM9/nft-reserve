<template>
  <div class="grid gap-4 grid-cols-3">
    <div
      v-for="(nft, i) in nfts"
      :key="nft"
      class="m-1 justify-center"
      :class="{ 'card-selected': selected[i] }"
      @click="toggleSelect(i)"
    >
      <img
        class="w-40 h-40"
        :src="nft.externalMetadata.image"
        :alt="nft.onchainMetadata.data.name"
      />
    </div>
  </div>
</template>

<style scoped>
.card-selected {
  opacity: 0.5;
}
</style>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  emits: ["selected"],
  props: {
    nfts: Array,
  },
  setup(props, ctx) {
    console.log(props.nfts);
    if (props.nfts) {
      const selected = ref<boolean[]>(props.nfts.map((x) => false));

      const toggleSelect = (idx: number) => {
        if (props.nfts) {
          let temp = selected.value[idx];
          selected.value = props.nfts.map((x) => false);
          selected.value[idx] = !temp;
          ctx.emit("selected", {
            selected: selected.value[idx],
            nft: props.nfts[idx],
          });
        }
      };
      return {
        toggleSelect,
        selected,
      };
    } else {
      return {};
    }
  },
});
</script>

<style scoped></style>
