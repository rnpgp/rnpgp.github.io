<script setup lang="ts">
defineProps<{ input: string; hex: string }>();
</script>

<template>
  <div class="text-center font-sans leading-snug">
    <p class="egg-librepgp text-xl font-bold tracking-tight text-gold-ink">LibrePGP</p>
    <p class="mt-1 text-[0.7rem] italic text-gold-ink/80">— the open OpenPGP specification</p>
    <p class="mt-1 font-mono text-[0.65rem] text-gold-ink/60">
      brought to you by g10 · Intevation · Ribose
    </p>
  </div>
</template>

<style scoped>
.egg-librepgp {
  animation: librepgp-glow 2.6s ease-in-out infinite;
}
@keyframes librepgp-glow {
  0%, 100% { text-shadow: 0 0 8px color-mix(in oklab, var(--gold) 60%, transparent); }
  50% { text-shadow: 0 0 16px color-mix(in oklab, var(--gold) 90%, transparent); }
}
@media (prefers-reduced-motion: reduce) {
  .egg-librepgp { animation: none; }
}
</style>
