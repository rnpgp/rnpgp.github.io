<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

type Mode = 'light' | 'dark' | 'system';

const mode = ref<Mode>('system');
let media: MediaQueryList | null = null;

const applyMode = (m: Mode) => {
  const dark = m === 'dark' || (m === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
};

const readMode = (): Mode => {
  const q = new URLSearchParams(location.search).get('theme');
  if (q === 'light' || q === 'dark') return q;
  const stored = localStorage.getItem('rnp-theme');
  return stored === 'light' || stored === 'dark' ? stored : 'system';
};

const cycle = () => {
  mode.value = mode.value === 'light' ? 'dark' : mode.value === 'dark' ? 'system' : 'light';
  if (mode.value === 'system') localStorage.removeItem('rnp-theme');
  else localStorage.setItem('rnp-theme', mode.value);
  applyMode(mode.value);
};

const onMedia = () => {
  if (mode.value === 'system') applyMode('system');
};

const onStorage = (e: StorageEvent) => {
  if (e.key === 'rnp-theme' || e.key === null) {
    mode.value = readMode();
    applyMode(mode.value);
  }
};

onMounted(() => {
  mode.value = readMode();
  applyMode(mode.value);
  media = matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', onMedia);
  window.addEventListener('storage', onStorage);
});

onUnmounted(() => {
  media?.removeEventListener('change', onMedia);
  window.removeEventListener('storage', onStorage);
});
</script>

<template>
  <button
    type="button"
    class="icon-btn flex h-9 w-9 items-center justify-center rounded-full transition-colors"
    :aria-label="`Theme: ${mode}. Activate to switch.`"
    :title="`Theme: ${mode}`"
    @click="cycle"
  >
    <svg v-if="mode === 'light'" viewBox="0 0 24 24" class="h-[1.1rem] w-[1.1rem]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8" />
    </svg>
    <svg v-else-if="mode === 'dark'" viewBox="0 0 24 24" class="h-[1.1rem] w-[1.1rem]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
    </svg>
    <svg v-else viewBox="0 0 24 24" class="h-[1.1rem] w-[1.1rem]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="12" rx="1.5" />
      <path d="M9 20h6" />
    </svg>
  </button>
</template>
