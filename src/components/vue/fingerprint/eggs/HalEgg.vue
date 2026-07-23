<script setup lang="ts">
defineProps<{ input: string; hex: string }>();
</script>

<template>
  <div class="flex items-center gap-4">
    <div class="hal-eye shrink-0"></div>
    <div>
      <p class="font-mono text-base font-bold tracking-wide text-[#ff1744]">I'M SORRY, DAVE.</p>
      <p class="mt-0.5 font-mono text-xs text-[#ff1744]/70">I'm afraid I can't do that.</p>
    </div>
  </div>
</template>

<style scoped>
.hal-eye {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #ff6b6b 0%, #ff1744 40%, #8b0000 100%);
  box-shadow: 0 0 16px #ff1744, inset 0 0 10px rgba(0, 0, 0, 0.5);
  animation: hal-pulse 2.4s ease-in-out infinite;
}
@keyframes hal-pulse {
  0%, 100% { box-shadow: 0 0 16px #ff1744, inset 0 0 10px rgba(0, 0, 0, 0.5); }
  50% { box-shadow: 0 0 28px #ff1744, inset 0 0 10px rgba(0, 0, 0, 0.5); }
}
@media (prefers-reduced-motion: reduce) {
  .hal-eye { animation: none; }
}
</style>
