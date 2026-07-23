<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{ text: string }>();

const GLYPHS = '0123456789ABCDEF$#@%&*+=~';
const display = ref(props.text);
let raf = 0;

const isPunct = (ch: string) => ch === ' ' || ch === '.' || ch === ',';

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
      out += isPunct(ch) ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    }
    display.value = out;
    if (t < 1) raf = requestAnimationFrame(tick);
    else display.value = text;
  };
  raf = requestAnimationFrame(tick);
};

/** Encrypt: scramble wave sweeps L→R, leaving the text fully mangled.
 *  Stays mangled — type 'decrypt' (or refresh) to restore. */
const runEncrypt = () => {
  cancelAnimationFrame(raf);
  const text = props.text;
  const total = text.length;
  const duration = 1400;
  const start = performance.now();

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const edge = Math.floor(total * t * t * (3 - 2 * t));
    let out = '';
    for (let i = 0; i < total; i++) {
      const ch = text[i];
      out += i < edge && !isPunct(ch)
        ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        : ch;
    }
    display.value = out;
    if (t < 1) raf = requestAnimationFrame(tick);
    // else: final state is fully scrambled — leave it
  };
  raf = requestAnimationFrame(tick);
};

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

onMounted(() => {
  // Passive auto-play respects reduced-motion…
  if (!reducedMotion()) run();
  // …but a user explicitly typing 'decrypt' or 'encrypt' always gets the effect.
  window.addEventListener('rnp:replay-hero', run);
  window.addEventListener('rnp:encrypt-hero', runEncrypt);
});

onUnmounted(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener('rnp:replay-hero', run);
  window.removeEventListener('rnp:encrypt-hero', runEncrypt);
});
</script>

<template>
  <span class="hero-decrypt">{{ display }}</span>
</template>
