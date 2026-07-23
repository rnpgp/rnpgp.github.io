<script setup lang="ts">
const props = defineProps<{ input: string; hex: string }>();
</script>

<template>
  <div class="font-mono text-[0.7rem] leading-snug">
    <div class="text-faint">-----BEGIN PGP MESSAGE-----</div>
    <div class="my-1 break-all text-foreground/85">
      {{ props.hex.slice(0, 48) }}<br />{{ props.hex.slice(48, 96) }}<br />{{ props.hex.slice(96) }}
    </div>
    <div class="text-faint">-----END PGP MESSAGE-----</div>
  </div>
</template>
