<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
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
        placeholder="Type anything…"
        class="mt-2 w-full rounded-md border border-line bg-background px-3.5 py-2.5 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-faint focus:border-accent"
      />

      <p class="mono-label mt-5 text-faint">Fingerprint</p>
      <div
        class="fingerprint mt-2 rounded-md border border-line bg-surface-dim p-4 text-[0.82rem] leading-loose"
        aria-live="polite"
      >
        <template v-if="groups.length">
          <span
            v-for="(g, i) in groups"
            :key="i"
            class="transition-colors"
            :class="i % 4 === 3 ? 'text-accent2' : i % 4 === 1 ? 'text-accent' : 'text-foreground'"
            >{{ g }}{{ i < groups.length - 1 ? ' ' : '' }}</span
          >
        </template>
        <span v-else class="text-faint">···· ···· ···· ···· ···· ···· ···· ····</span>
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
