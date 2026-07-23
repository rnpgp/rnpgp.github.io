<script setup lang="ts">
defineProps<{ input: string; hex: string }>();
</script>

<template>
  <div class="text-center font-sans leading-snug">
    <p class="text-sm italic text-foreground">
      "Privacy is the power to selectively reveal oneself to the world."
    </p>
    <p class="mt-1.5 font-mono text-[0.7rem] text-faint">
      — Eric Hughes · A Cypherpunk's Manifesto (1993)
    </p>
  </div>
</template>
