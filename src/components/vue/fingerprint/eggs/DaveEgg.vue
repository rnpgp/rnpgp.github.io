<script setup lang="ts">
defineProps<{ input: string; hex: string }>();
</script>

<template>
  <div class="font-mono text-xs leading-snug">
    <p class="text-cyan-300">&gt; Open the pod bay doors, HAL.</p>
    <p class="mt-1.5 text-[#ff4757]/80">— transmission pending —</p>
  </div>
</template>
