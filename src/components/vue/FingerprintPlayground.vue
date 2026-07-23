<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import CopyButton from './CopyButton.vue';
import { dispatch, RNP_EVENTS } from '@/lib/events';
import { EGG_REGISTRY } from './fingerprint/registry';
import type { EggDef } from './fingerprint/types';

const input = ref('LibrePGP');
const hex = ref('');
const supported = ref(true);

const sha256 = async (text: string): Promise<string> => {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
};

const update = async () => {
  if (!input.value) {
    hex.value = '';
    return;
  }
  try {
    hex.value = await sha256(input.value);
  } catch {
    supported.value = false;
  }
};

const groups = computed(() => (hex.value ? (hex.value.match(/.{1,4}/g) ?? []) : []));
const keyId = computed(() => (hex.value ? hex.value.slice(-16) : ''));
const fingerprintText = computed(() => groups.value.join(' '));

let hashTimer: ReturnType<typeof setTimeout> | undefined;
watch(input, () => {
  clearTimeout(hashTimer);
  hashTimer = setTimeout(update, 120);
});

/* =========================== EASTER EGGS =========================== */
const activeEgg = ref<EggDef | null>(null);
let eggTimer: ReturnType<typeof setTimeout> | undefined;

const initialValue = 'LibrePGP';
const touched = ref(false);

/* Default background + passive hex-word badge (not eggs — the box's idle state). */
const HEX_WORDS = [
  'DEAD', 'BEEF', 'CAFE', 'BABE', 'FACE', 'FADE', 'FEED', 'DEAF', 'BEAD', 'DEED', 'SEED', 'ABED',
  'ACED', 'ACE', 'BAD', 'CAB', 'CAD', 'DAD', 'FAD', 'F00D', 'BOO', 'ADD', 'DAB', 'DAD0',
];
const hexWord = computed(() => {
  if (!hex.value) return null;
  const head = hex.value.slice(0, 4);
  if (HEX_WORDS.includes(head)) return head;
  const first8 = hex.value.slice(0, 8);
  for (const w of HEX_WORDS) if (first8.includes(w)) return w;
  return null;
});

const eggBackground = computed(() => {
  if (activeEgg.value) return activeEgg.value.background;
  return hexWord.value
    ? 'border-gold/40 bg-[color-mix(in_oklab,var(--gold)_10%,var(--surface-dim))]'
    : 'border-line bg-surface-dim';
});

const triggerEgg = (egg: EggDef) => {
  activeEgg.value = egg;
  clearTimeout(eggTimer);
  eggTimer = setTimeout(
    () => {
      if (activeEgg.value === egg) activeEgg.value = null;
    },
    egg.duration,
  );
  if (egg.sceneEvent === 'halScene') dispatch(RNP_EVENTS.halScene);
  else if (egg.sceneEvent === 'daveScene') dispatch(RNP_EVENTS.daveScene);
};

watch(input, (val, oldVal) => {
  if (!touched.value && oldVal === initialValue && val !== initialValue) touched.value = true;
  clearTimeout(eggTimer);
  if (val === initialValue && !touched.value) {
    activeEgg.value = null;
    return;
  }
  const match = EGG_REGISTRY.find(({ trigger }) => trigger.test(val));
  if (match) triggerEgg(match);
  else activeEgg.value = null;
});

/* Typing 'rnp' or 'pgp' in the input also kicks off the full-screen hex rain. */
let lastRainInput = '';
watch(input, (val) => {
  const matches = /\b(rnp|pgp)\b/i.test(val);
  if (matches && val !== lastRainInput) {
    lastRainInput = val;
    dispatch(RNP_EVENTS.hexRain);
  } else if (!matches) {
    lastRainInput = '';
  }
});

/* 'decrypt' / 'encrypt' drive the hero animation. Decrypt wins if both present. */
let lastHeroInput = '';
watch(input, (val) => {
  let evt: (typeof RNP_EVENTS)[keyof typeof RNP_EVENTS] | null = null;
  if (/decrypt/i.test(val)) evt = RNP_EVENTS.replayHero;
  else if (/encrypt/i.test(val)) evt = RNP_EVENTS.encryptHero;
  if (evt && val !== lastHeroInput) {
    lastHeroInput = val;
    dispatch(evt);
  } else if (!evt) {
    lastHeroInput = '';
  }
});

/* Rotating placeholder hints to aid discoverability without spoiling. */
const PLACEHOLDERS = [
  'Type anything…',
  'Try "matrix"…',
  'Try "snowden"…',
  'Try "42"…',
  'Try "thunderbird"…',
  'Try "openpgp"…',
  'Try "hal 9000"…',
  'Try "dave"…',
  'Try "pqc"…',
  'Try "librepgp"…',
  'Try "dh"…',
  'Try "otp"…',
  'Try "enigma"…',
  'Try "phil"…',
];
const placeholder = ref(PLACEHOLDERS[0]);
let phIdx = 0;
let phTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  supported.value = typeof crypto !== 'undefined' && !!crypto.subtle;
  update();
  phTimer = setInterval(() => {
    if (!input.value && document.activeElement?.id !== 'fp-input') {
      phIdx = (phIdx + 1) % PLACEHOLDERS.length;
      placeholder.value = PLACEHOLDERS[phIdx];
    }
  }, 3500);
});

onUnmounted(() => {
  clearTimeout(eggTimer);
  clearTimeout(hashTimer);
  clearInterval(phTimer);
});
</script>

<template>
  <div class="card overflow-hidden">
    <div class="flex items-center justify-between border-b border-line bg-surface-dim px-5 py-3">
      <span class="mono-label">SHA-256 · live fingerprint</span>
      <span class="flex h-2 w-2">
        <span class="absolute h-2 w-2 animate-ping rounded-full bg-teal opacity-75"></span>
        <span class="h-2 w-2 rounded-full bg-teal"></span>
      </span>
    </div>

    <div class="p-5">
      <label for="fp-input" class="mono-label text-faint">Message</label>
      <input
        id="fp-input"
        v-model="input"
        type="text"
        autocomplete="off"
        spellcheck="false"
        :placeholder="placeholder"
        class="mt-2 w-full rounded-md border border-line bg-background px-3.5 py-2.5 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-faint focus:border-accent"
      />

      <p class="mono-label mt-5 text-faint">Fingerprint</p>
      <div
        class="fingerprint relative mt-2 min-h-[8rem] overflow-hidden rounded-md border p-4 text-[0.82rem] leading-loose transition-colors duration-300"
        :class="eggBackground"
        aria-live="polite"
      >
        <template v-if="activeEgg">
          <component
            :is="activeEgg.component"
            :input="input"
            :hex="hex"
          />
        </template>

        <template v-else>
          <template v-if="groups.length">
            <span
              v-for="(g, i) in groups"
              :key="i"
              class="transition-colors"
              :class="i % 4 === 3 ? 'text-accent2' : i % 4 === 1 ? 'text-accent' : 'text-foreground'"
              >{{ g }}{{ i < groups.length - 1 ? ' ' : '' }}</span
            >
          </template>
          <span v-else class="text-faint">···· ···· ···· ···· ···· ···· ···· ···· ···· ···· ···· ···· ···· ···· ···· ····</span>
        </template>

        <div
          v-if="hexWord && !activeEgg"
          class="absolute right-2 top-2 rounded-full bg-gold/20 px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-wider text-gold-ink egg-sparkle"
        >
          ✨ {{ hexWord }}
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span class="font-mono text-xs text-faint">
          KEY ID&nbsp;&nbsp;<span class="text-foreground">{{ keyId || '—' }}</span>
        </span>
        <CopyButton v-if="groups.length" :text="fingerprintText" label="Copy fingerprint" />
      </div>

      <p v-if="!supported" class="mt-3 font-mono text-xs text-gold-ink">
        WebCrypto unavailable in this browser.
      </p>
    </div>

    <div class="border-t border-line bg-surface-dim px-5 py-2.5">
      <p class="font-mono text-[0.7rem] text-faint">Computed locally — nothing leaves this page.</p>
    </div>
  </div>
</template>

<style scoped>
.egg-sparkle {
  animation: sparkle 1.6s ease-in-out infinite;
}
@keyframes sparkle {
  0%, 100% { opacity: 0.75; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}
@media (prefers-reduced-motion: reduce) {
  .egg-sparkle { animation: none; }
}
</style>
