<script setup lang="ts">
defineProps<{ input: string; hex: string }>();
</script>

<template>
  <div class="text-center">
    <div class="flex items-center justify-center gap-3">
      <span class="dh-can bg-rose-500" title="Alice's secret"></span>
      <span class="font-mono text-faint">+</span>
      <span class="dh-can bg-blue-500" title="Bob's secret"></span>
      <span class="font-mono text-faint">→</span>
      <span class="dh-can bg-purple-600 dh-shared" title="shared secret"></span>
    </div>
    <p class="mt-3 font-mono text-[0.65rem] text-purple-200/70">
      Public exchange, private result. (Diffie–Hellman, 1976)
    </p>
  </div>
</template>

<style scoped>
.dh-can {
  display: inline-block;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  box-shadow: inset -3px -4px 6px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.25);
}
.dh-shared {
  animation: dh-shimmer 2.4s ease-in-out infinite;
}
@keyframes dh-shimmer {
  0%, 100% { filter: brightness(1) saturate(1); }
  50% { filter: brightness(1.25) saturate(1.3); }
}
@media (prefers-reduced-motion: reduce) {
  .dh-shared { animation: none; }
}
</style>
