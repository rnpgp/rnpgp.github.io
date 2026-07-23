<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue';

defineProps<{ input: string; hex: string }>();

const enigmaRotors = ref<string[]>(['R', 'N', 'P']);
let enigmaTimer: ReturnType<typeof setInterval> | undefined;

const step = () => {
  const next = [...enigmaRotors.value];
  for (let i = next.length - 1; i >= 0; i--) {
    const c = next[i].charCodeAt(0);
    const shifted = ((c - 65 + 1) % 26) + 65;
    next[i] = String.fromCharCode(shifted);
    if (shifted !== 65) break; // no carry
  }
  enigmaRotors.value = next;
};

watch(
  () => enigmaRotors,
  () => {
    clearInterval(enigmaTimer);
    enigmaTimer = setInterval(step, 600);
  },
  { immediate: true });
onUnmounted(() => clearInterval(enigmaTimer));
</script>

<template>
  <div class="text-center">
    <div class="flex items-center justify-center gap-2">
      <div v-for="(letter, i) in enigmaRotors" :key="i" class="enigma-rotor">
        <span class="enigma-letter">{{ letter }}</span>
      </div>
    </div>
    <p class="mt-3 font-mono text-[0.65rem] text-gray-400">
      ³-rotor cipher · Wehrmacht, 1934–1945
    </p>
  </div>
</template>

<style scoped>
.enigma-rotor {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.375rem;
  background: linear-gradient(180deg, #2a2a2c 0%, #1a1a1c 50%, #0a0a0c 100%);
  border: 1px solid #3a3a3c;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 rgba(0, 0, 0, 0.5),
    0 2px 6px rgba(0, 0, 0, 0.5);
}
.enigma-letter {
  font-family: var(--font-mono);
  font-size: 1.25rem;
  font-weight: 700;
  color: #d0d0d4;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.15);
}
</style>
