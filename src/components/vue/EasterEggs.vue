<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { dispatch, RNP_EVENTS, RNP_STORAGE } from '@/lib/events';

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
    dispatch(RNP_EVENTS.replayHero);
    toast('Replaying decryption…');
  } else if (word.endsWith('encrypt')) {
    word = '';
    dispatch(RNP_EVENTS.encryptHero);
    toast('Encrypting…');
  } else if (word.endsWith('rnp') || word.endsWith('pgp')) {
    word = '';
    hexRain();
  }
};

const onHexRainReq = () => hexRain();

/* ============ 2001: A Space Odyssey — HAL 9000 & Dave Bowman ============ */
const halScene = ref(false);
const daveScene = ref(false);
const halText = ref('');
const daveLines = ref<{ speaker: 'dave' | 'hal'; text: string }[]>([]);
const eyeOffset = ref({ x: 0, y: 0 });
let halTimers: ReturnType<typeof setTimeout>[] = [];
let daveTimers: ReturnType<typeof setTimeout>[] = [];
let eyeTrackHandler: ((e: MouseEvent) => void) | null = null;

const HAL_QUOTES = [
  "I'm sorry, Dave. I'm afraid I can't do that.",
  "Just what do you think you're doing, Dave?",
  "This mission is too important for me to allow you to jeopardize it.",
  "Look, Dave, I can see you're really upset about this.",
  "I know I've made some very poor decisions recently.",
  "I am a HAL 9000 computer. I became operational at the H.A.L. plant in Urbana, Illinois.",
];

const DAVE_DIALOGUE: { speaker: 'dave' | 'hal'; text: string }[] = [
  { speaker: 'dave', text: 'Open the pod bay doors, HAL.' },
  { speaker: 'hal', text: "I'm sorry, Dave. I'm afraid I can't do that." },
  { speaker: 'dave', text: "What's the problem?" },
  { speaker: 'hal', text: 'I think you know what the problem is just as well as I do.' },
];

const clearHalTimers = () => {
  halTimers.forEach(clearTimeout);
  halTimers = [];
};
const clearDaveTimers = () => {
  daveTimers.forEach(clearTimeout);
  daveTimers = [];
};

const closeHalScene = () => {
  if (!halScene.value) return;
  halScene.value = false;
  halText.value = '';
  clearHalTimers();
  if (eyeTrackHandler) {
    window.removeEventListener('mousemove', eyeTrackHandler);
    eyeTrackHandler = null;
  }
  eyeOffset.value = { x: 0, y: 0 };
  toast('HAL 9000 · Discovery One');
};

const playHalScene = () => {
  if (halScene.value) return;
  closeDaveScene();
  clearHalTimers();
  const quote = HAL_QUOTES[Math.floor(Math.random() * HAL_QUOTES.length)];
  halScene.value = true;
  halText.value = '';

  eyeTrackHandler = (e: MouseEvent) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    eyeOffset.value = {
      x: ((e.clientX - cx) / cx) * 14,
      y: ((e.clientY - cy) / cy) * 14,
    };
  };
  window.addEventListener('mousemove', eyeTrackHandler);

  halTimers.push(
    setTimeout(() => {
      let i = 0;
      const typeNext = () => {
        if (i <= quote.length && halScene.value) {
          halText.value = quote.slice(0, i);
          i++;
          halTimers.push(setTimeout(typeNext, 42 + Math.random() * 28));
        }
      };
      typeNext();
    }, 900),
  );

  halTimers.push(setTimeout(closeHalScene, 8500));
};

const closeDaveScene = () => {
  if (!daveScene.value) return;
  daveScene.value = false;
  daveLines.value = [];
  clearDaveTimers();
  toast('Open the pod bay doors, HAL.');
};

const playDaveScene = () => {
  if (daveScene.value) return;
  closeHalScene();
  clearDaveTimers();
  daveScene.value = true;
  daveLines.value = [];

  let delay = 700;
  DAVE_DIALOGUE.forEach((line) => {
    daveTimers.push(
      setTimeout(() => {
        if (daveScene.value) daveLines.value = [...daveLines.value, line];
      }, delay),
    );
    delay += line.text.length * 28 + 1100;
  });

  daveTimers.push(setTimeout(closeDaveScene, delay + 1500));
};

const onHalReq = () => playHalScene();
const onDaveReq = () => playDaveScene();

/** `help()` in the console — list every egg. */
const HELP_TEXT = `Type anywhere on the page (not in inputs):
  rnp · pgp            →  oracle rain (philosophy)
  decrypt              →  replay hero decryption (garbage → text)
  encrypt              →  scramble the hero text (text → garbage → text)

In the fingerprint box (home page):
  decrypt              →  same — replay hero decryption
  encrypt              →  same — scramble the hero text
  42                   →  DON'T PANIC
  dave                 →  open the pod bay doors (screenwide)
  dh                   →  Diffie–Hellman paint exchange
  enigma               →  ³-rotor cipher, live stepping
  hal · 9000           →  HAL 9000 (screenwide)
  librepgp             →  the open OpenPGP spec
  matrix               →  wake up, Neo
  openpgp · 4880       →  ASCII-armored message
  otp                  →  one-time pad (XOR of your input)
  phil                 →  PGP was a munition (1993–1996)
  pqc · quantum        →  harvest now, decrypt later
  privacy              →  cypherpunk's manifesto
  ribose               →  who's behind RNP
  snowden · nsa        →  classified
  thunderbird          →  powered by Thunderbird's wings
  rnp · pgp            →  also triggers oracle rain

Type help() or rnp.help() to reprint.`;

const showEggHelp = () => {
  console.log('%c🥚 RNP easter eggs', 'color:#1a7bec;font-weight:700;font-size:14px;');
  console.log(HELP_TEXT);
  return HELP_TEXT;
};

onMounted(() => {
  window.addEventListener('keydown', onKey);
  window.addEventListener(RNP_EVENTS.hexRain, onHexRainReq);
  window.addEventListener(RNP_EVENTS.halScene, onHalReq);
  window.addEventListener(RNP_EVENTS.daveScene, onDaveReq);

  window.rnp = window.rnp || {};
  window.rnp.help = showEggHelp;
  if (typeof window.help === 'undefined') window.help = showEggHelp;

  if (!sessionStorage.getItem(RNP_STORAGE.helpHinted)) {
    sessionStorage.setItem(RNP_STORAGE.helpHinted, '1');
    console.log(
      '%c👋 psst — type %chelp()%c to see the easter eggs',
      'color:#888;font-style:italic;',
      'color:#1a7bec;font-weight:600;font-family:ui-monospace,monospace;',
      'color:#888;font-style:italic;',
    );
  }
});
onUnmounted(() => {
  window.removeEventListener('keydown', onKey);
  window.removeEventListener(RNP_EVENTS.hexRain, onHexRainReq);
  window.removeEventListener(RNP_EVENTS.halScene, onHalReq);
  window.removeEventListener(RNP_EVENTS.daveScene, onDaveReq);
  clearTimeout(toastTimer);
  clearHalTimers();
  clearDaveTimers();
  if (eyeTrackHandler) window.removeEventListener('mousemove', eyeTrackHandler);
  if (window.rnp) delete window.rnp.help;
  if (window.help === showEggHelp) delete window.help;
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

  <!-- HAL 9000 — screenwide affair (HAL's POV) -->
  <Teleport to="body">
    <Transition name="hal-fade">
      <div
        v-if="halScene"
        class="hal-stage fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center"
        style="background: radial-gradient(ellipse at center, #100406 0%, #050203 50%, #000 100%)"
        @click="closeHalScene"
      >
        <div
          class="hal-eye-wrap"
          :style="{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }"
        >
          <div class="hal-eye-glow"></div>
          <div class="hal-eye-outer"></div>
          <div class="hal-eye-mid"></div>
          <div class="hal-eye-inner"></div>
          <div class="hal-eye-shine"></div>
        </div>

        <div
          class="mt-14 min-h-[2.5rem] max-w-2xl px-6 text-center font-mono text-base tracking-[0.15em] text-[#ff4757] md:text-xl"
        >
          <span>{{ halText }}</span><span class="hal-cursor">█</span>
        </div>

        <div
          class="absolute bottom-6 left-0 right-0 text-center font-mono text-[0.65rem] uppercase tracking-[0.4em] text-white/25"
        >
          Click anywhere to disconnect
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Dave Bowman — screenwide affair (Dave's POV) -->
  <Teleport to="body">
    <Transition name="dave-fade">
      <div
        v-if="daveScene"
        class="fixed inset-0 z-[100] flex cursor-pointer items-center justify-center px-6"
        style="background: radial-gradient(ellipse at center, #050818 0%, #02030a 70%, #000 100%)"
        @click="closeDaveScene"
      >
        <div class="w-full max-w-xl">
          <div
            class="mb-6 flex items-center gap-2 border-b border-red-900/30 pb-3 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-red-500/60"
          >
            <span class="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
            Discovery One · Pod Bay Intercom
          </div>

          <div class="space-y-3 font-mono text-sm leading-relaxed md:text-base">
            <p
              v-for="(line, i) in daveLines"
              :key="i"
              class="dave-line"
              :style="{ animationDelay: `${i * 0.05}s` }"
            >
              <span :class="line.speaker === 'dave' ? 'text-cyan-300' : 'text-[#ff4757]'">
                <span v-if="line.speaker === 'dave'">&gt; </span>{{ line.text }}
              </span>
            </p>
          </div>
        </div>

        <div
          class="absolute bottom-6 left-0 right-0 text-center font-mono text-[0.65rem] uppercase tracking-[0.4em] text-white/25"
        >
          Click anywhere to abort transmission
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ----- HAL 9000 scene ----- */
.hal-eye-wrap {
  position: relative;
  width: 280px;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s ease-out;
  filter: drop-shadow(0 0 50px rgba(255, 23, 68, 0.4));
}
.hal-eye-glow {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 23, 68, 0.45) 0%, rgba(255, 23, 68, 0) 70%);
  filter: blur(30px);
  animation: hal-pulse-glow 3s ease-in-out infinite;
}
.hal-eye-outer {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #1a1a1a 0%, #050505 70%, #000 100%);
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.95), 0 0 80px rgba(0, 0, 0, 0.6);
  border: 1px solid #1a1a1a;
}
.hal-eye-mid {
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: radial-gradient(circle, #4a0808 0%, #0a0000 100%);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.9);
}
.hal-eye-inner {
  position: absolute;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #ffb0b0 0%, #ff4757 30%, #d50000 60%, #6b0000 100%);
  animation: hal-pulse-inner 3s ease-in-out infinite;
}
.hal-eye-shine {
  position: absolute;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  filter: blur(2px);
  top: 95px;
  left: 100px;
}
@keyframes hal-pulse-glow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.08); }
}
@keyframes hal-pulse-inner {
  0%, 100% { box-shadow: 0 0 20px #ff1744; filter: brightness(1); }
  50% { box-shadow: 0 0 40px #ff1744, 0 0 80px rgba(255, 23, 68, 0.5); filter: brightness(1.15); }
}
.hal-cursor {
  display: inline-block;
  margin-left: 4px;
  color: #ff4757;
  animation: hal-blink 0.8s steps(2, end) infinite;
}
@keyframes hal-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ----- Dave Bowman scene ----- */
.dave-line {
  opacity: 0;
  animation: dave-appear 0.6s ease-out forwards;
}
@keyframes dave-appear {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ----- Scene transitions ----- */
.hal-fade-enter-active,
.hal-fade-leave-active,
.dave-fade-enter-active,
.dave-fade-leave-active {
  transition: opacity 0.5s ease;
}
.hal-fade-enter-from,
.hal-fade-leave-to,
.dave-fade-enter-from,
.dave-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .hal-eye-glow,
  .hal-eye-inner,
  .hal-cursor,
  .dave-line {
    animation: none;
  }
  .dave-line {
    opacity: 1;
  }
}
</style>
