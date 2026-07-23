<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { RNP_EVENTS } from '@/lib/events';

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

const open = ref(false);
const query = ref('');
const results = ref<SearchResult[]>([]);
const selected = ref(0);
const loading = ref(false);
const unavailable = ref(false);
const inputEl = ref<HTMLInputElement | null>(null);

let pagefind: any = null;
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

const loadIndex = async () => {
  if (pagefind || unavailable.value) return;
  try {
    // Loaded at runtime from the Pagefind index emitted post-build.
    // The indirection keeps Vite from trying to resolve the URL at build/dev time.
    const runtimeImport = new Function('u', 'return import(u)') as (u: string) => Promise<any>;
    pagefind = await runtimeImport('/pagefind/pagefind.js');
    await pagefind.init();
  } catch {
    unavailable.value = true;
  }
};

const openModal = async () => {
  open.value = true;
  await nextTick();
  inputEl.value?.focus();
  loadIndex();
};

const close = () => {
  open.value = false;
  query.value = '';
  results.value = [];
  selected.value = 0;
};

const runSearch = async () => {
  if (!pagefind || !query.value.trim()) {
    results.value = [];
    return;
  }
  loading.value = true;
  try {
    const search = await pagefind.debouncedSearch(query.value, { limit: 12 });
    if (!search) return; // superseded by a newer query
    const data = await Promise.all(search.results.map((r: any) => r.data()));
    results.value = data.map((d: any) => ({
      url: d.url,
      title: d.meta?.title ?? d.url,
      excerpt: d.excerpt ?? '',
    }));
    selected.value = 0;
  } finally {
    loading.value = false;
  }
};

watch(query, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runSearch, 160);
});

watch(open, (v) => {
  document.documentElement.style.overflow = v ? 'hidden' : '';
});

const onKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    open.value ? close() : openModal();
    return;
  }
  if (e.key === '/' && !open.value) {
    const target = e.target as HTMLElement;
    if (!['INPUT', 'TEXTAREA'].includes(target.tagName) && !target.isContentEditable) {
      e.preventDefault();
      openModal();
    }
    return;
  }
  if (!open.value) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowDown' && results.value.length) {
    e.preventDefault();
    selected.value = (selected.value + 1) % results.value.length;
  }
  if (e.key === 'ArrowUp' && results.value.length) {
    e.preventDefault();
    selected.value = (selected.value - 1 + results.value.length) % results.value.length;
  }
  if (e.key === 'Enter' && results.value[selected.value]) {
    window.location.href = results.value[selected.value].url;
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  window.addEventListener(RNP_EVENTS.openSearch, openModal as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  window.removeEventListener(RNP_EVENTS.openSearch, openModal as EventListener);
  document.documentElement.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition name="search">
      <div
        v-if="open"
        class="fixed inset-0 z-[70] flex items-start justify-center bg-navy/50 px-4 pt-[10vh] backdrop-blur-sm"
        @click.self="close"
      >
        <div
          class="card w-full max-w-xl overflow-hidden shadow-lift"
          role="dialog"
          aria-modal="true"
          aria-label="Site search"
        >
          <div class="flex items-center gap-3 border-b border-line px-4">
            <svg viewBox="0 0 24 24" class="h-4.5 w-4.5 shrink-0 text-faint" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              ref="inputEl"
              v-model="query"
              type="search"
              placeholder="Search RNP — releases, docs, specs…"
              class="w-full bg-transparent py-3.5 font-sans text-base text-foreground outline-none placeholder:text-faint"
              aria-label="Search query"
            />
            <kbd class="mono-label shrink-0 rounded border border-line px-1.5 py-0.5">ESC</kbd>
          </div>

          <div class="max-h-[55vh] overflow-y-auto">
            <p v-if="unavailable" class="px-5 py-8 text-center text-sm text-muted">
              Search index not found. Run
              <code class="font-mono text-accent">npm run build</code>
              to generate it.
            </p>
            <p v-else-if="query && !loading && !results.length" class="px-5 py-8 text-center text-sm text-muted">
              No results for “{{ query }}”.
            </p>
            <ul v-else-if="results.length" class="divide-y divide-line">
              <li v-for="(r, i) in results" :key="r.url">
                <a
                  :href="r.url"
                  class="block px-5 py-3.5 transition-colors"
                  :class="i === selected ? 'bg-surface-dim' : ''"
                  @mousemove="selected = i"
                >
                  <span class="block font-sans text-[0.95rem] font-bold text-foreground">{{ r.title }}</span>
                  <!-- pagefind excerpt contains safe <mark> markup -->
                  <span class="search-excerpt mt-0.5 block text-sm leading-relaxed text-muted" v-html="r.excerpt"></span>
                </a>
              </li>
            </ul>
            <p v-else class="px-5 py-6 text-sm text-muted">
              Type to search releases, documentation, specifications and advisories.
            </p>
          </div>

          <div class="flex items-center justify-between border-t border-line bg-surface-dim px-4 py-2">
            <span class="mono-label">Pagefind</span>
            <span class="font-mono text-xs text-faint">↑↓ navigate · ↵ open</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-enter-active,
.search-leave-active {
  transition: opacity 0.18s ease;
}
.search-enter-from,
.search-leave-to {
  opacity: 0;
}
:deep(.search-excerpt mark) {
  background: color-mix(in oklab, var(--color-gold) 55%, transparent);
  color: var(--fg);
  border-radius: 2px;
  padding: 0 1px;
}
</style>
