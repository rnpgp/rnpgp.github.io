<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import CopyButton from './CopyButton.vue';

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

let timer: ReturnType<typeof setTimeout> | undefined;
watch(input, () => {
  clearTimeout(timer);
  timer = setTimeout(update, 120);
});

onMounted(() => {
  supported.value = typeof crypto !== 'undefined' && !!crypto.subtle;
  update();
});

/* =========================== EASTER EGGS =========================== */
type Egg =
  | 'matrix'
  | 'redacted'
  | 'panic'
  | 'thunderbird'
  | 'armor'
  | 'hal'
  | 'dave'
  | 'pqc'
  | 'librepgp'
  | 'ribose'
  | 'privacy'
  | 'dh'
  | 'otp'
  | 'enigma'
  | 'phil'
  | null;

const EGGS: { trigger: RegExp; egg: Exclude<Egg, null> }[] = [
  { trigger: /\b(matrix|neo|wake\s*up|mr\.?\s*anderson)\b/i, egg: 'matrix' },
  { trigger: /\b(snowden|nsa|prism|classified|top\s*secret|redact(ed)?)\b/i, egg: 'redacted' },
  { trigger: /\b(42|don'?t\s*panic|hitchhiker|arthur\s*dent)\b/i, egg: 'panic' },
  { trigger: /\bthunderbird\b/i, egg: 'thunderbird' },
  { trigger: /\b(pgp\s*message|ascii\s*armor|openpgp|4880)\b/i, egg: 'armor' },
  { trigger: /\b(hal(\s*9000)?|hal9000|9000|monolith|space\s*odyssey|2001)\b/i, egg: 'hal' },
  { trigger: /\b(dave(\s*bowman)?|bowman|pod\s*bay\s*doors?)\b/i, egg: 'dave' },
  { trigger: /\b(pqc|post[-\s]*quantum|quantum|9980)\b/i, egg: 'pqc' },
  { trigger: /\blibrepgp\b/i, egg: 'librepgp' },
  { trigger: /\bribose\b/i, egg: 'ribose' },
  { trigger: /\bprivacy\b/i, egg: 'privacy' },
  { trigger: /\b(dh|diffie[\s-]*hellman)\b/i, egg: 'dh' },
  { trigger: /\b(otp|one[\s-]*time[\s-]*pad|vernam)\b/i, egg: 'otp' },
  { trigger: /\benigma\b/i, egg: 'enigma' },
  { trigger: /\b(phil|zimmermann|munitions?)\b/i, egg: 'phil' },
];

const EGG_DURATIONS: Record<Exclude<Egg, null>, number> = {
  matrix: 5000,
  redacted: 5000,
  panic: 5000,
  thunderbird: 5000,
  armor: 5000,
  hal: 9000,
  dave: 11000,
  pqc: 5000,
  librepgp: 5000,
  ribose: 5000,
  privacy: 5000,
  dh: 6000,
  otp: 6000,
  enigma: 6000,
  phil: 6000,
};

const eggBackground = computed(() => {
  switch (activeEgg.value) {
    case 'matrix': return 'border-emerald-500/40 bg-[#00150a]';
    case 'redacted': return 'border-red-900/60 bg-black';
    case 'panic': return 'border-amber-500/50 bg-[#fdf6e3]';
    case 'hal': return 'border-[#ff1744]/40 bg-[#1a0606]';
    case 'dave': return 'border-cyan-900/50 bg-[#040810]';
    case 'pqc': return 'border-cyan-500/40 bg-[#061a1f]';
    case 'dh': return 'border-purple-500/40 bg-[#0e0420]';
    case 'otp': return 'border-emerald-500/40 bg-[#021810]';
    case 'enigma': return 'border-gray-500/40 bg-[#0a0a0c]';
    case 'phil': return 'border-amber-700/40 bg-[#f5edd6]';
    case 'librepgp': return 'border-gold/50 bg-[color-mix(in_oklab,var(--gold)_14%,var(--surface-dim))]';
    default:
      return hexWord.value
        ? 'border-gold/40 bg-[color-mix(in_oklab,var(--gold)_10%,var(--surface-dim))]'
        : 'border-line bg-surface-dim';
  }
});

const activeEgg = ref<Egg>(null);
let eggTimer: ReturnType<typeof setTimeout> | undefined;

const initialValue = 'LibrePGP';
const touched = ref(false);

/* OTP egg: plaintext (input) + random key + XOR ciphertext, snapshotted once. */
const otpData = ref<{ plain: string; key: string; cipher: string } | null>(null);

/* Enigma egg: 3 rotor letters, stepping every 600ms while active. */
const enigmaRotors = ref<string[]>(['R', 'N', 'P']);
let enigmaTimer: ReturnType<typeof setInterval> | undefined;

watch(input, (val, oldVal) => {
  if (!touched.value && oldVal === initialValue && val !== initialValue) touched.value = true;
  clearTimeout(eggTimer);
  if (val === initialValue && !touched.value) {
    activeEgg.value = null;
    return;
  }
  const match = EGGS.find(({ trigger }) => trigger.test(val));
  if (match) {
    activeEgg.value = match.egg;
    eggTimer = setTimeout(
      () => {
        if (activeEgg.value === match.egg) activeEgg.value = null;
      },
      EGG_DURATIONS[match.egg],
    );
  } else {
    activeEgg.value = null;
  }
});

/* HAL & Dave eggs kick off screenwide scenes (rendered by EasterEggs.vue).
   The inline egg below is just a small "establishing" indicator; the real
   payload is the full-viewport overlay dispatched here. */
watch(activeEgg, (egg) => {
  if (egg === 'hal') window.dispatchEvent(new CustomEvent('rnp:hal-scene'));
  else if (egg === 'dave') window.dispatchEvent(new CustomEvent('rnp:dave-scene'));

  /* OTP: snapshot input as plaintext the moment the egg fires, generate a
     random key of equal length, compute ciphertext = P ⊕ K. */
  if (egg === 'otp' && input.value) {
    const textBytes = new TextEncoder().encode(input.value);
    const keyBytes = new Uint8Array(textBytes.length);
    crypto.getRandomValues(keyBytes);
    const cipherBytes = new Uint8Array(textBytes.length);
    for (let i = 0; i < textBytes.length; i++) cipherBytes[i] = textBytes[i] ^ keyBytes[i];
    const toHex = (b: Uint8Array) =>
      Array.from(b)
        .map((x) => x.toString(16).padStart(2, '0').toUpperCase())
        .join(' ');
    otpData.value = {
      plain: toHex(textBytes),
      key: toHex(keyBytes),
      cipher: toHex(cipherBytes),
    };
  } else if (egg !== 'otp') {
    otpData.value = null;
  }

  /* Enigma: 3 rotors stepping Enigma-style every 600ms (rightmost first,
     carrying left when it wraps past Z). */
  clearInterval(enigmaTimer);
  if (egg === 'enigma') {
    enigmaTimer = setInterval(() => {
      const next = [...enigmaRotors.value];
      for (let i = next.length - 1; i >= 0; i--) {
        const c = next[i].charCodeAt(0);
        const shifted = ((c - 65 + 1) % 26) + 65;
        next[i] = String.fromCharCode(shifted);
        if (shifted !== 65) break;
      }
      enigmaRotors.value = next;
    }, 600);
  }
});

/* Typing 'rnp' or 'pgp' in the input also kicks off the full-screen hex rain
   (same effect as the global key listener — wired up in EasterEggs.vue). */
let lastRainInput = '';
watch(input, (val) => {
  const matches = /\b(rnp|pgp)\b/i.test(val);
  if (matches && val !== lastRainInput) {
    lastRainInput = val;
    window.dispatchEvent(new CustomEvent('rnp:hex-rain'));
  } else if (!matches) {
    lastRainInput = '';
  }
});

/* Typing 'decrypt' in the input also replays the hero decryption animation. */
let lastDecryptInput = '';
watch(input, (val) => {
  const matches = /\bdecrypt\b/i.test(val);
  if (matches && val !== lastDecryptInput) {
    lastDecryptInput = val;
    window.dispatchEvent(new CustomEvent('rnp:replay-hero'));
  } else if (!matches) {
    lastDecryptInput = '';
  }
});

/* Matrix rain glyphs — regenerate on a tick so they feel alive. */
const matrixTick = ref(0);
let matrixTimer: ReturnType<typeof setInterval> | undefined;
const MATRIX_POOL = '0123456789ABCEFｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂ';
const matrixGroups = computed(() => {
  void matrixTick.value;
  if (activeEgg.value !== 'matrix') return [];
  return Array.from({ length: 16 }, () =>
    Array.from({ length: 4 }, () => MATRIX_POOL[Math.floor(Math.random() * MATRIX_POOL.length)]).join(
      '',
    ),
  );
});
watch(activeEgg, (egg) => {
  clearInterval(matrixTimer);
  if (egg === 'matrix') matrixTimer = setInterval(() => matrixTick.value++, 220);
});

/* Redacted bars. */
const redactedGroups = Array.from({ length: 16 }, () => '████');

/* Passive hex-word detector — when the actual SHA-256 starts with a known
   "hex word", surface a small gold badge. Pure serendipity. */
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

const THUNDERBIRD_PATH =
  'M314.805 154.949H314.865C336.905 77.8991 432.945 40.2891 530.815 40.2891C598.445 40.2891 659.156 61.6991 700.776 95.6891C675.938 96.8603 651.414 101.734 628.016 110.149C661.646 122.649 690.535 141.879 711.945 165.669C695.792 162.889 679.413 161.65 663.026 161.969C703.302 220.312 724.82 289.554 724.706 360.449C724.706 553.749 568.005 710.449 374.705 710.449C184.385 710.449 24.7051 551.099 24.7051 360.449C24.7051 330.339 28.7051 299.249 36.4751 270.089C38.5151 263.969 41.3551 258.099 45.1251 255.949C49.8451 253.259 54.1451 261.279 54.8351 263.889C59.9528 283.059 66.839 301.712 75.4051 319.609C74.6551 279.649 91.7251 243.249 115.205 211.769C130.865 190.779 145.385 171.329 152.085 115.199C152.535 111.429 156.105 108.719 159.715 109.899C210.675 126.579 237.915 211.439 233.685 282.399C261.835 286.429 261.705 257.019 261.705 257.019C252.705 229.359 258.705 177.949 314.705 154.949H314.805Z';

onMounted(() => {
  phTimer = setInterval(() => {
    if (!input.value && document.activeElement?.id !== 'fp-input') {
      phIdx = (phIdx + 1) % PLACEHOLDERS.length;
      placeholder.value = PLACEHOLDERS[phIdx];
    }
  }, 3500);
});

onUnmounted(() => {
  clearTimeout(eggTimer);
  clearTimeout(timer);
  clearInterval(matrixTimer);
  clearInterval(phTimer);
  clearInterval(enigmaTimer);
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
        <!-- MATRIX -->
        <div v-if="activeEgg === 'matrix'" class="font-mono">
          <span
            v-for="(g, i) in matrixGroups"
            :key="`m${i}-${matrixTick}`"
            class="matrix-glyph inline-block"
            :style="{ animationDelay: `${(i % 8) * 60}ms` }"
            >{{ g }}{{ i < matrixGroups.length - 1 ? ' ' : '' }}</span
          >
        </div>

        <!-- REDACTED -->
        <div v-else-if="activeEgg === 'redacted'" class="relative select-none">
          <div class="font-mono text-black">
            <span v-for="(g, i) in redactedGroups" :key="`r${i}`" class="opacity-90"
              >{{ g }}{{ i < redactedGroups.length - 1 ? ' ' : '' }}</span
            >
          </div>
          <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              class="egg-stamp rotate-[-14deg] rounded border-[3px] border-[#b91c1c] px-3 py-1 font-mono text-base font-black uppercase tracking-[0.3em] text-[#b91c1c]"
              >Classified</span
            >
          </div>
        </div>

        <!-- DON'T PANIC -->
        <div v-else-if="activeEgg === 'panic'" class="text-center">
          <p
            class="egg-panic-title font-sans text-2xl font-bold tracking-tight text-[#1a3a5c] md:text-3xl"
          >
            DON'T PANIC
          </p>
          <p class="mt-1 font-mono text-[0.7rem] text-[#7a5a1a]">
            — in big, friendly letters on its cover
          </p>
        </div>

        <!-- THUNDERBIRD -->
        <div v-else-if="activeEgg === 'thunderbird'" class="relative flex h-10 items-center">
          <div class="egg-bird flex items-center gap-3 whitespace-nowrap">
            <svg
              viewBox="0 0 750 750"
              class="egg-bird-icon h-7 w-7 text-accent"
              fill="currentColor"
              aria-hidden="true"
            >
              <path :d="THUNDERBIRD_PATH" />
            </svg>
            <span class="font-mono text-sm text-accent">Powered by Thunderbird's wings.</span>
          </div>
        </div>

        <!-- ASCII ARMOR -->
        <div v-else-if="activeEgg === 'armor'" class="font-mono text-[0.7rem] leading-snug">
          <div class="text-faint">-----BEGIN PGP MESSAGE-----</div>
          <div class="my-1 break-all text-foreground/85">
            {{ hex.slice(0, 48) }}<br />{{ hex.slice(48, 96) }}<br />{{ hex.slice(96) }}
          </div>
          <div class="text-faint">-----END PGP MESSAGE-----</div>
        </div>

        <!-- HAL 9000 -->
        <div v-else-if="activeEgg === 'hal'" class="flex items-center gap-4">
          <div class="hal-eye shrink-0"></div>
          <div>
            <p class="font-mono text-base font-bold tracking-wide text-[#ff1744]">I'M SORRY, DAVE.</p>
            <p class="mt-0.5 font-mono text-xs text-[#ff1744]/70">I'm afraid I can't do that.</p>
          </div>
        </div>

        <!-- DAVE BOWMAN (lockout terminal — full scene plays screenwide) -->
        <div v-else-if="activeEgg === 'dave'" class="font-mono text-xs leading-snug">
          <p class="text-cyan-300">&gt; Open the pod bay doors, HAL.</p>
          <p class="mt-1.5 text-[#ff4757]/80">— transmission pending —</p>
        </div>

        <!-- POST-QUANTUM -->
        <div v-else-if="activeEgg === 'pqc'" class="text-center font-sans leading-snug">
          <p class="font-mono text-sm font-bold uppercase tracking-[0.25em] text-cyan-400 egg-pqc">
            Harvest now.
          </p>
          <p
            class="font-mono text-sm font-bold uppercase tracking-[0.25em] text-cyan-400 egg-pqc"
            style="animation-delay: 0.35s"
          >
            Decrypt later.
          </p>
          <p class="mt-2 text-[0.7rem] text-cyan-300/70">— the post-quantum adversary is patient</p>
        </div>

        <!-- LIBREPGP -->
        <div v-else-if="activeEgg === 'librepgp'" class="text-center font-sans leading-snug">
          <p class="egg-librepgp text-xl font-bold tracking-tight text-gold-ink">LibrePGP</p>
          <p class="mt-1 text-[0.7rem] italic text-gold-ink/80">— the open OpenPGP specification</p>
          <p class="mt-1 font-mono text-[0.65rem] text-gold-ink/60">
            brought to you by g10 · Intevation · Ribose
          </p>
        </div>

        <!-- RIBOSE -->
        <div v-else-if="activeEgg === 'ribose'" class="text-center font-sans leading-snug">
          <p class="text-sm italic text-foreground">
            "Open source is a development methodology; free software is a social movement."
          </p>
          <p class="mt-1.5 font-mono text-[0.7rem] text-faint">— Ribose · the people behind RNP</p>
        </div>

        <!-- PRIVACY -->
        <div v-else-if="activeEgg === 'privacy'" class="text-center font-sans leading-snug">
          <p class="text-sm italic text-foreground">
            "Privacy is the power to selectively reveal oneself to the world."
          </p>
          <p class="mt-1.5 font-mono text-[0.7rem] text-faint">
            — Eric Hughes · A Cypherpunk's Manifesto (1993)
          </p>
        </div>

        <!-- DIFFIE–HELLMAN (paint-mixing key exchange) -->
        <div v-else-if="activeEgg === 'dh'" class="dh-egg text-center">
          <div class="flex items-center justify-center gap-3">
            <span class="dh-can bg-rose-500" title="Alice's secret"></span>
            <span class="font-mono text-faint">+</span>
            <span class="dh-can bg-blue-500" title="Bob's secret"></span>
            <span class="font-mono text-faint">→</span>
            <span class="dh-can bg-purple-600 dh-shared" title="shared secret"></span>
          </div>
          <p class="mt-3 font-mono text-[0.65rem] text-purple-200/70">
            Public exchange, private result. (Diffie–Hellman, 1976)
          </p>
        </div>

        <!-- ONE-TIME PAD (plaintext ⊕ key = ciphertext, computed from input) -->
        <div v-else-if="activeEgg === 'otp'" class="font-mono text-[0.7rem] leading-snug">
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

        <!-- ENIGMA (3-rotor stepping) -->
        <div v-else-if="activeEgg === 'enigma'" class="text-center">
          <div class="flex items-center justify-center gap-2">
            <div v-for="(letter, i) in enigmaRotors" :key="i" class="enigma-rotor">
              <span class="enigma-letter">{{ letter }}</span>
            </div>
          </div>
          <p class="mt-3 font-mono text-[0.65rem] text-gray-400">
            ³-rotor cipher · Wehrmacht, 1934–1945
          </p>
        </div>

        <!-- PHIL ZIMMERMANN (PGP "munition" stamp, 1993–1996) -->
        <div v-else-if="activeEgg === 'phil'" class="text-center">
          <div class="phil-stamp egg-stamp-phil">
            <span class="phil-stamp-text">Munition</span>
            <span class="phil-stamp-sub">ITAR · US Customs · 1993–1996</span>
          </div>
          <p class="mt-3 font-mono text-[0.65rem] text-[#5a3a0a]">
            PGP was a weapon. Zimmermann under investigation for 3 years.
          </p>
        </div>

        <!-- DEFAULT FINGERPRINT -->
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

        <!-- HEX WORD BADGE -->
        <div
          v-if="hexWord && !activeEgg"
          class="egg-sparkle absolute right-2 top-2 rounded-full bg-gold/20 px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-wider text-gold-ink"
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
.matrix-glyph {
  color: #00ff41;
  text-shadow: 0 0 6px #00ff41, 0 0 12px rgba(0, 255, 65, 0.4);
  animation: matrix-flicker 0.35s steps(2, jump-none) infinite;
}
@keyframes matrix-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

.egg-stamp {
  background: rgba(185, 28, 28, 0.08);
  animation: stamp-in 0.5s cubic-bezier(0.5, -0.4, 0.4, 1.8) forwards;
}
@keyframes stamp-in {
  0% { transform: rotate(-14deg) scale(2.6); opacity: 0; }
  60% { transform: rotate(-14deg) scale(0.92); opacity: 1; }
  100% { transform: rotate(-14deg) scale(1); opacity: 1; }
}

.egg-panic-title {
  animation: panic-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes panic-in {
  0% { transform: scale(0.3) rotate(-6deg); opacity: 0; letter-spacing: 0.4em; }
  100% { transform: scale(1) rotate(0); opacity: 1; letter-spacing: normal; }
}

.egg-bird {
  animation: bird-fly 2.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.egg-bird-icon {
  transform-origin: center;
  animation: bird-flap 0.28s ease-in-out infinite;
}
@keyframes bird-fly {
  0% { transform: translateX(-110%); }
  55% { transform: translateX(35%); }
  100% { transform: translateX(110%); }
}
@keyframes bird-flap {
  0%, 100% { transform: scaleY(1) rotate(0deg); }
  50% { transform: scaleY(0.7) rotate(-3deg); }
}

.egg-sparkle {
  animation: sparkle 1.6s ease-in-out infinite;
}
@keyframes sparkle {
  0%, 100% { opacity: 0.75; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

.hal-eye {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #ff6b6b 0%, #ff1744 40%, #8b0000 100%);
  box-shadow: 0 0 16px #ff1744, inset 0 0 10px rgba(0, 0, 0, 0.5);
  animation: hal-pulse 2.4s ease-in-out infinite;
}
@keyframes hal-pulse {
  0%, 100% { box-shadow: 0 0 16px #ff1744, inset 0 0 10px rgba(0, 0, 0, 0.5); }
  50% { box-shadow: 0 0 28px #ff1744, inset 0 0 10px rgba(0, 0, 0, 0.5); }
}

.egg-pqc {
  animation: pqc-flicker 2.2s ease-in-out infinite;
}
@keyframes pqc-flicker {
  0%, 100% { opacity: 1; text-shadow: 0 0 8px rgba(34, 211, 238, 0.5); }
  50% { opacity: 0.85; text-shadow: 0 0 14px rgba(34, 211, 238, 0.9); }
}

.egg-librepgp {
  animation: librepgp-glow 2.6s ease-in-out infinite;
}
@keyframes librepgp-glow {
  0%, 100% { text-shadow: 0 0 8px color-mix(in oklab, var(--gold) 60%, transparent); }
  50% { text-shadow: 0 0 16px color-mix(in oklab, var(--gold) 90%, transparent); }
}

/* Diffie–Hellman paint cans */
.dh-can {
  display: inline-block;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  box-shadow: inset -3px -4px 6px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.25);
}
.dh-shared {
  animation: dh-shimmer 2.4s ease-in-out infinite;
}
@keyframes dh-shimmer {
  0%, 100% { filter: brightness(1) saturate(1); }
  50% { filter: brightness(1.25) saturate(1.3); }
}

/* Enigma rotors */
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

/* Phil Zimmermann rubber stamp */
.phil-stamp {
  display: inline-block;
  border: 3px double #b91c1c;
  padding: 0.4rem 1.1rem;
  background: rgba(185, 28, 28, 0.08);
}
.phil-stamp-text {
  display: block;
  font-family: var(--font-mono);
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #b91c1c;
}
.phil-stamp-sub {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(185, 28, 28, 0.7);
  margin-top: 0.25rem;
}
.egg-stamp-phil {
  animation: phil-stamp 0.5s cubic-bezier(0.5, -0.4, 0.4, 1.8) forwards;
}
@keyframes phil-stamp {
  0% { transform: rotate(-8deg) scale(3); opacity: 0; filter: blur(4px); }
  60% { transform: rotate(-8deg) scale(0.92); opacity: 1; filter: blur(0); }
  100% { transform: rotate(-8deg) scale(1); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .matrix-glyph,
  .egg-stamp,
  .egg-panic-title,
  .egg-bird,
  .egg-bird-icon,
  .egg-sparkle,
  .hal-eye,
  .egg-pqc,
  .egg-librepgp,
  .dh-shared,
  .egg-stamp-phil {
    animation: none;
  }
}
</style>
