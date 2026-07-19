<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

const toastMsg = ref('');
const toastEl = ref<HTMLElement | null>(null);
let toastTimer: ReturnType<typeof setTimeout> | undefined;

const toast = (msg: string) => {
  toastMsg.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(async () => {
    // dissolve: disperses upward, blurring away like steam
    await toastEl.value
      ?.animate(
        [
          { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0) scale(1)' },
          { opacity: 0, filter: 'blur(8px)', transform: 'translateY(-8px) scale(1.02)' },
        ],
        { duration: 380, easing: 'cubic-bezier(.4, 0, .8, .4)', fill: 'forwards' },
      )
      .finished.catch(() => {});
    toastMsg.value = '';
  }, 2600);
};

watch(toastMsg, async (msg) => {
  if (!msg) return;
  await nextTick();
  // materialize: condenses out of a blur and settles into place
  toastEl.value?.animate(
    [
      { opacity: 0, filter: 'blur(10px)', transform: 'translateY(10px) scale(0.96)' },
      { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0) scale(1)' },
    ],
    { duration: 340, easing: 'cubic-bezier(.22, 1.1, .36, 1)' },
  );
});

/* ---- Secret words: type 'rnp' or 'pgp' → oracle rain; 'decrypt' → replay hero ---- */
let word = '';

/** Ancient philosophy about reality, east and west — the messages the rain forms. */
const ORACLE: { text: string; source: string; script: 'latin' | 'greek' }[] = [
  { text: 'PANTA RHEI', source: 'Heraclitus · everything flows', script: 'greek' },
  { text: 'NATURE LOVES TO HIDE', source: 'Heraclitus · fragment 123', script: 'latin' },
  { text: 'ALL THINGS ARE NUMBERS', source: 'Pythagoras', script: 'latin' },
  {
    text: 'THE NAMED TAO IS NOT THE ETERNAL TAO',
    source: 'Lao Tzu · Tao Te Ching §1',
    script: 'latin',
  },
  { text: 'I KNOW THAT I KNOW NOTHING', source: 'Socrates', script: 'latin' },
  {
    text: 'THE CAVE IS NOT THE WORLD',
    source: 'Plato · Allegory of the Cave',
    script: 'latin',
  },
  {
    text: 'ALL WARFARE IS BASED ON DECEPTION',
    source: 'Sun Tzu · The Art of War',
    script: 'latin',
  },
  { text: 'A DREAM, A BUBBLE, A SHADOW', source: 'Diamond Sutra', script: 'latin' },
  { text: 'PERSPECTIVE, NOT TRUTH', source: 'Marcus Aurelius · Meditations', script: 'latin' },
  {
    text: 'AM I A BUTTERFLY DREAMING OF A MAN?',
    source: 'Zhuangzi · the butterfly dream',
    script: 'latin',
  },
  { text: 'KNOW WHAT YOU KNOW, AND NOT', source: 'Confucius · Analects 2.17', script: 'latin' },
  { text: 'ΠΑΝΤΑ ΑΡΙΘΜΟΣ', source: 'Pythagoras · all is number', script: 'greek' },
];

const POOLS = {
  hex: '0123456789ABCDEF',
  latin: '0123456789ABCDEF$#@%&*+=~',
  greek: 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΠΡΣΤΥΦΧΨΩ0123456789',
};

const hexRain = () => {
  // User-initiated (typed a secret word): always play — prefers-reduced-motion
  // only governs passive animation, never something the user asked for.
  const oracle = ORACLE[Math.floor(Math.random() * ORACLE.length)];
  const canvas = document.createElement('canvas');
  canvas.className = 'pointer-events-none fixed inset-0 z-[90]';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  const colors = ['#1a7bec', '#00dfb7', '#ffdc4a'];
  const fontSize = 16;
  const cols = Math.ceil(canvas.width / fontSize);
  const glyphFor = () => {
    const pool = Math.random() < 0.6 ? POOLS.hex : POOLS[oracle.script];
    return pool[Math.floor(Math.random() * pool.length)];
  };
  const drops = Array.from({ length: cols }, () => ({
    y: Math.random() * -canvas.height,
    speed: 1.5 + Math.random() * 3.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    glyph: glyphFor(),
  }));

  /* Message layout: fit to width, centered, drawn per character. */
  const chars = [...oracle.text];
  let msgSize = 22;
  let widths: number[] = [];
  let totalW = 0;
  const measure = () => {
    ctx.font = `700 ${msgSize}px "IBM Plex Mono", "PingFang SC", "Noto Sans CJK SC", monospace`;
    widths = chars.map((c) => ctx.measureText(c).width);
    totalW = widths.reduce((a, b) => a + b, 0) + (chars.length - 1) * 4;
  };
  measure();
  while (totalW > canvas.width * 0.88 && msgSize > 12) {
    msgSize -= 2;
    measure();
  }
  const targets: { c: string; x: number }[] = [];
  let pen = (canvas.width - totalW) / 2;
  chars.forEach((c, i) => {
    targets.push({ c, x: pen });
    pen += widths[i] + 4;
  });
  const midY = canvas.height / 2;

  /* Phases: pour → chars rain down one by one in random order → hover → dissolve. */
  const order = chars.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  // The quote's characters are citizens of the mass rain from the start:
  // each falls in its own column, and lands in place when its turn comes.
  const msgs = targets.map((t) => ({
    ...t,
    y: Math.random() * -canvas.height,
    speed: 1.5 + Math.random() * 2,
  }));
  const POUR = 2400;
  const STEP = Math.max(55, Math.min(150, 1800 / chars.length));
  const LAND = 420;
  const lastLand = POUR + STEP * (chars.length - 1) + LAND;
  const LINGER = lastLand + 1300;
  const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3);
  const lerpY = (a: number, b: number, p: number) => a + (b - a) * p;
  const start = performance.now();
  let raf = 0;
  canvas.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: 'forwards' });

  const drawRain = (t: number, dim: number, trail: number) => {
    ctx.fillStyle = `rgba(8, 10, 22, ${trail})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;
    ctx.shadowBlur = 0;
    for (let i = 0; i < cols; i++) {
      const d = drops[i];
      ctx.globalAlpha = dim;
      ctx.fillStyle = d.color;
      ctx.fillText(d.glyph, i * fontSize, d.y);
      d.y += d.speed * fontSize * 0.55;
      if (d.y > canvas.height) {
        d.y = Math.random() * -220;
        d.speed = 1.5 + Math.random() * 3.5;
        d.color = colors[Math.floor(Math.random() * colors.length)];
        d.glyph = glyphFor();
      }
    }
    ctx.globalAlpha = 1;
  };

  const drawMessage = (t: number) => {
    ctx.textBaseline = 'middle';
    for (let k = 0; k < order.length; k++) {
      const i = order[k];
      const m = msgs[i];
      const landT = POUR + k * STEP;
      if (t < landT) {
        // still falling with everyone else, a quiet glint in the stream
        m.y += m.speed * fontSize * 0.55;
        if (m.y > canvas.height) m.y = Math.random() * -220;
        ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#ffdc4a';
        ctx.shadowColor = '#ffdc4a';
        ctx.shadowBlur = 4;
        ctx.fillText(m.c, m.x, m.y);
      } else {
        // its turn: glides to the middle and stays
        const p = Math.min(1, (t - landT) / LAND);
        const y = p < 1 ? lerpY(m.y, midY, easeOutCubic(p)) : midY;
        const hover = p >= 1 && t > lastLand ? Math.sin((t + i * 140) / 420) * 2.5 : 0;
        ctx.font = `700 ${msgSize}px "IBM Plex Mono", "PingFang SC", "Noto Sans CJK SC", monospace`;
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffdc4a';
        ctx.shadowColor = '#ffdc4a';
        ctx.shadowBlur = 4 + 10 * p;
        ctx.fillText(m.c, m.x, y + hover);
      }
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.textBaseline = 'alphabetic';
  };

  const tick = (now: number) => {
    const t = now - start;
    if (t < lastLand) {
      // ambient rain fades out while the message chars land
      const dim =
        t < POUR ? 1 : Math.max(0.05, 0.22 * (1 - (t - POUR) / Math.max(1, lastLand - POUR)));
      drawRain(t, t < POUR ? 1 : dim, t < POUR ? 0.14 : 0.3);
    } else {
      drawRain(t, 0.05, 0.4); // rain gone — the message stands clear
    }
    drawMessage(t); // stream-citizen message chars, from t=0

    if (t < LINGER) {
      raf = requestAnimationFrame(tick);
    } else {
      canvas
        .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' })
        .finished.then(() => {
          cancelAnimationFrame(raf);
          canvas.remove();
          toast(`«${oracle.text}» — ${oracle.source}`);
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
    class="pointer-events-none fixed inset-x-0 bottom-6 z-[95] flex justify-center"
    role="status"
  >
    <div ref="toastEl" class="card px-4 py-2 font-mono text-sm text-foreground shadow-lift">
      {{ toastMsg }}
    </div>
  </div>
</template>
