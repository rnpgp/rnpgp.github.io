<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

const toastMsg = ref('');
const toastEl = ref<HTMLElement | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | undefined;

const toast = (msg: string) => {
  toastMsg.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastMsg.value = ''), 2400);
};

watch(toastMsg, async (msg) => {
  if (!msg) return;
  await nextTick();
  toastEl.value?.animate(
    [
      { opacity: 0, transform: 'translate(-50%, 10px)' },
      { opacity: 1, transform: 'translate(-50%, 0)' },
    ],
    { duration: 220, easing: 'cubic-bezier(.22, 1, .36, 1)' },
  );
});

/* ---- Secret words: type 'rnp' or 'pgp' → brand hex rain; 'decrypt' → replay hero ---- */
let word = '';

const hexRain = () => {
  // User-initiated (typed a secret word): always play — prefers-reduced-motion
  // only governs passive animation, never something the user asked for.
  const canvas = document.createElement('canvas');
  canvas.className = 'pointer-events-none fixed inset-0 z-[90]';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  const glyphs = '0123456789ABCDEF';
  const colors = ['#1a7bec', '#00dfb7', '#ffdc4a'];
  const fontSize = 16;
  const cols = Math.ceil(canvas.width / fontSize);
  const drops = Array.from({ length: cols }, () => ({
    y: Math.random() * -canvas.height,
    speed: 1.5 + Math.random() * 3.5,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  let raf = 0;
  const DURATION = 3400;
  const start = performance.now();
  canvas.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: 'forwards' });

  const tick = (now: number) => {
    ctx.fillStyle = 'rgba(8, 10, 22, 0.14)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;
    for (let i = 0; i < cols; i++) {
      const d = drops[i];
      ctx.fillStyle = d.color;
      ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * fontSize, d.y);
      d.y += d.speed * fontSize * 0.55;
      if (d.y > canvas.height) {
        d.y = Math.random() * -220;
        d.speed = 1.5 + Math.random() * 3.5;
        d.color = colors[Math.floor(Math.random() * colors.length)];
      }
    }
    if (now - start < DURATION) {
      raf = requestAnimationFrame(tick);
    } else {
      canvas
        .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, fill: 'forwards' })
        .finished.then(() => {
          cancelAnimationFrame(raf);
          canvas.remove();
          toast('Entropy acquired ✓');
        });
    }
  };
  raf = requestAnimationFrame(tick);
};

const onKey = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null;
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  const k = e.key.toLowerCase();
  if (!/^[a-z]$/.test(k)) {
    word = '';
    return;
  }

  word = (word + k).slice(-12);
  if (word.endsWith('decrypt')) {
    word = '';
    window.dispatchEvent(new CustomEvent('rnp:replay-hero'));
    toast('Replaying decryption…');
  } else if (word.endsWith('rnp') || word.endsWith('pgp')) {
    word = '';
    hexRain();
  }
};

onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => {
  window.removeEventListener('keydown', onKey);
  clearTimeout(toastTimer);
});
</script>

<template>
  <div
    v-if="toastMsg"
    ref="toastEl"
    class="card fixed bottom-6 left-1/2 z-[95] -translate-x-1/2 px-4 py-2 font-mono text-sm text-foreground shadow-lift"
    role="status"
  >
    {{ toastMsg }}
  </div>
</template>
