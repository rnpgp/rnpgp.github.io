<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{ input: string; hex: string }>();

const otpData = ref<{ plain: string; key: string; cipher: string } | null>(null);

const compute = (text: string) => {
  if (!text) { otpData.value = null; return; }
  const textBytes = new TextEncoder().encode(text);
  const keyBytes = new Uint8Array(textBytes.length);
  crypto.getRandomValues(keyBytes);
  const cipherBytes = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i++) cipherBytes[i] = textBytes[i] ^ keyBytes[i];
  const toHex = (b: Uint8Array) =>
    Array.from(b).map((x) => x.toString(16).padStart(2, '0').toUpperCase()).join(' ');
  otpData.value = {
    plain: toHex(textBytes),
    key: toHex(keyBytes),
    cipher: toHex(cipherBytes),
  };
};

// Snapshot once on mount; re-snapshot if input changes while the egg is active.
watch(() => props.input, compute, { immediate: true });
</script>

<template>
  <div class="font-mono text-[0.7rem] leading-snug">
    <div v-if="otpData" class="space-y-1">
      <div class="flex gap-2">
        <span class="w-5 shrink-0 font-bold text-emerald-400">P</span>
        <span class="break-all text-emerald-50/90">{{ otpData.plain }}</span>
      </div>
      <div class="flex gap-2">
        <span class="w-5 shrink-0 font-bold text-amber-400">K</span>
        <span class="break-all text-emerald-50/90">{{ otpData.key }}</span>
      </div>
      <div class="flex gap-2">
        <span class="w-5 shrink-0 font-bold text-rose-400">C</span>
        <span class="break-all text-emerald-50/90">{{ otpData.cipher }}</span>
      </div>
    </div>
    <p class="mt-2 text-center text-[0.65rem] text-emerald-200/80">
      ⊕ — mathematically proven unbreakable. Use once.
    </p>
  </div>
</template>
