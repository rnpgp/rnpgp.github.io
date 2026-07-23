<script setup lang="ts">
defineProps<{ input: string; hex: string }>();
const redactedGroups = Array.from({ length: 16 }, () => '████');
</script>

<template>
  <div class="relative select-none">
    <div class="font-mono text-black">
      <span v-for="(g, i) in redactedGroups" :key="`r${i}`" class="opacity-90"
        >{{ g }}{{ i < redactedGroups.length - 1 ? ' ' : '' }}</span
      >
    </div>
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span
        class="egg-stamp rotate-[-14deg] rounded border-[3px] border-[#b91c1c] px-3 py-1 font-mono text-base font-black uppercase tracking-[0.3em] text-[#b91c1c]"
        >Classified</span
      >
    </div>
  </div>
</template>

<style scoped>
.egg-stamp {
  background: rgba(185, 28, 28, 0.08);
  animation: stamp-in 0.5s cubic-bezier(0.5, -0.4, 0.4, 1.8) forwards;
}
@keyframes stamp-in {
  0% { transform: rotate(-14deg) scale(2.6); opacity: 0; }
  60% { transform: rotate(-14deg) scale(0.92); opacity: 1; }
  100% { transform: rotate(-14deg) scale(1); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .egg-stamp { animation: none; }
}
</style>
