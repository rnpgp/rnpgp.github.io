<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{ text: string }>();

const GLYPHS = '0123456789ABCDEF$#@%&*+=~';
const display = ref(props.text);
let raf = 0;

const run = () => {
  cancelAnimationFrame(raf);
  const text = props.text;
  const total = text.length;
  const duration = 1400;
  const start = performance.now();

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    // ease-out: most characters settle early, tail scrambles longer
    const settled = Math.floor(total * t * t * (3 - 2 * t));
    let out = text.slice(0, settled);
    for (let i = settled; i < total; i++) {
      const ch = text[i];
      out += ch === ' ' || ch === '.' || ch === ',' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    }
    display.value = out;
    if (t < 1) raf = requestAnimationFrame(tick);
    else display.value = text;
  };
  raf = requestAnimationFrame(tick);
};

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

onMounted(() => {
  // Passive auto-play respects reduced-motion…
  if (!reducedMotion()) run();
  // …but a user explicitly typing 'decrypt' always gets the replay.
  window.addEventListener('rnp:replay-hero', run);
});

onUnmounted(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener('rnp:replay-hero', run);
});
</script>

<template>
  <span class="hero-decrypt">{{ display }}</span>
</template>
