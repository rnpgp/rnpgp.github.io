<script setup lang="ts">
defineProps<{ input: string; hex: string }>();
</script>

<template>
  <div class="text-center">
    <p class="egg-panic-title font-sans text-2xl font-bold tracking-tight text-[#1a3a5c] md:text-3xl">
      DON'T PANIC
    </p>
    <p class="mt-1 font-mono text-[0.7rem] text-[#7a5a1a]">
      — in big, friendly letters on its cover
    </p>
  </div>
</template>

<style scoped>
.egg-panic-title {
  animation: panic-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes panic-in {
  0% { transform: scale(0.3) rotate(-6deg); opacity: 0; letter-spacing: 0.4em; }
  100% { transform: scale(1) rotate(0); opacity: 1; letter-spacing: normal; }
}
@media (prefers-reduced-motion: reduce) {
  .egg-panic-title { animation: none; }
}
</style>
