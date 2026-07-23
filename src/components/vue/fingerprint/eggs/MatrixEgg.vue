<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{ input: string; hex: string }>();

const matrixTick = ref(0);
let matrixTimer: ReturnType<typeof setInterval> | undefined;
const MATRIX_POOL = '0123456789ABCEFｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂ';

const matrixGroups = computed(() => {
  void matrixTick.value;
  void props.input; // re-randomise when input changes during the egg
  return Array.from({ length: 16 }, () =>
    Array.from({ length: 4 }, () => MATRIX_POOL[Math.floor(Math.random() * MATRIX_POOL.length)]).join(''),
  );
});

watch(
  () => props.input,
  () => {
    clearInterval(matrixTimer);
    matrixTimer = setInterval(() => matrixTick.value++, 220);
  },
  { immediate: true });
onUnmounted(() => clearInterval(matrixTimer));
</script>

<template>
  <div class="font-mono">
    <span
      v-for="(g, i) in matrixGroups"
      :key="`m${i}-${matrixTick}`"
      class="matrix-glyph inline-block"
      :style="{ animationDelay: `${(i % 8) * 60}ms` }"
    >{{ g }}{{ i < matrixGroups.length - 1 ? ' ' : '' }}</span>
  </div>
</template>

<style scoped>
.matrix-glyph {
  color: #00ff41;
  text-shadow: 0 0 6px #00ff41, 0 0 12px rgba(0, 255, 65, 0.4);
  animation: matrix-flicker 0.35s steps(2, jump-none) infinite;
}
@keyframes matrix-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
@media (prefers-reduced-motion: reduce) {
  .matrix-glyph { animation: none; }
}
</style>
