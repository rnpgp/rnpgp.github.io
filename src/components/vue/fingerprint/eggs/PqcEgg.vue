<script setup lang="ts">
defineProps<{ input: string; hex: string }>();
</script>

<template>
  <div class="text-center font-sans leading-snug">
    <p class="font-mono text-sm font-bold uppercase tracking-[0.25em] text-cyan-400 egg-pqc">
      Harvest now.
    </p>
    <p
      class="font-mono text-sm font-bold uppercase tracking-[0.25em] text-cyan-400 egg-pqc"
      style="animation-delay: 0.35s"
    >
      Decrypt later.
    </p>
    <p class="mt-2 text-[0.7rem] text-cyan-300/70">— the post-quantum adversary is patient</p>
  </div>
</template>

<style scoped>
.egg-pqc {
  animation: pqc-flicker 2.2s ease-in-out infinite;
}
@keyframes pqc-flicker {
  0%, 100% { opacity: 1; text-shadow: 0 0 8px rgba(34, 211, 238, 0.5); }
  50% { opacity: 0.85; text-shadow: 0 0 14px rgba(34, 211, 238, 0.9); }
}
@media (prefers-reduced-motion: reduce) {
  .egg-pqc { animation: none; }
}
</style>
