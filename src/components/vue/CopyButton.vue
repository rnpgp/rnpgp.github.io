<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(
  defineProps<{
    text: string;
    label?: string;
    dark?: boolean;
  }>(),
  { label: 'Copy', dark: false },
);

const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = props.text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  copied.value = true;
  clearTimeout(timer);
  timer = setTimeout(() => (copied.value = false), 1600);
};
</script>

<template>
  <button
    type="button"
    class="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs transition-all"
    :class="[
      dark
        ? 'border-white/15 text-white/70 hover:border-white/40 hover:text-white'
        : 'border-line bg-surface text-muted hover:border-accent hover:text-accent',
      copied ? (dark ? 'border-teal! text-teal!' : 'border-accent2! text-accent2!') : '',
    ]"
    :aria-label="copied ? 'Copied to clipboard' : label"
    @click="copy"
  >
    <svg v-if="!copied" viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
    <svg v-else viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
    <span>{{ copied ? 'Copied' : label }}</span>
  </button>
</template>
