<script setup lang="ts">
import CopyButton from './CopyButton.vue';

interface KeyInfo {
  fingerprint: string;
  keyId: string;
  userId: string;
  file: string;
  current: boolean;
}

defineProps<{ keys: KeyInfo[] }>();

const group = (fp: string) => fp.match(/.{1,4}/g)?.join(' ') ?? fp;
</script>

<template>
  <div class="space-y-6">
    <article v-for="key in keys" :key="key.fingerprint" class="card overflow-hidden">
      <header
        class="flex items-center justify-between border-b border-line bg-surface-dim px-5 py-3"
      >
        <span class="mono-label">Release signing key</span>
        <span
          v-if="key.current"
          class="rounded-full border border-accent2/40 bg-accent2/10 px-2.5 py-0.5 font-mono text-xs font-bold text-accent2"
          >current</span
        >
        <span
          v-else
          class="rounded-full border border-line px-2.5 py-0.5 font-mono text-xs text-muted"
          >previous</span
        >
      </header>

      <div class="p-5">
        <p class="mono-label">Fingerprint</p>
        <p
          class="fingerprint mt-2 rounded-md border border-line bg-surface-dim p-4 text-[0.82rem] leading-loose break-all"
        >
          {{ group(key.fingerprint.toUpperCase()) }}
        </p>
        <div class="mt-4 space-y-2">
          <div>
            <span class="mono-label inline-block w-28">Key ID</span>
            <span class="font-mono text-sm">{{ key.keyId }}</span>
          </div>
          <div>
            <span class="mono-label inline-block w-28">User ID</span>
            <span class="break-all font-mono text-sm">{{ key.userId }}</span>
          </div>
        </div>
      </div>

      <footer class="flex items-center justify-between border-t border-line px-5 py-3">
        <a :href="key.file" download class="btn btn-ghost px-3 py-1.5 text-xs">Download .asc</a>
        <CopyButton :text="group(key.fingerprint.toUpperCase())" label="Copy fingerprint" />
      </footer>
    </article>
  </div>
</template>
