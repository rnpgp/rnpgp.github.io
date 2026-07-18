<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import ThemeToggle from './ThemeToggle.vue';

const props = defineProps<{ currentPath: string; overlay?: boolean }>();

const links = [
  { href: '/software/', label: 'Software' },
  { href: '/specs/', label: 'Specifications' },
  { href: '/blog/', label: 'Blog' },
  { href: '/docs/', label: 'Manual' },
  { href: '/about/', label: 'About' },
];

const isActive = (href: string) => props.currentPath.startsWith(href);

const hidden = ref(false);
const scrolled = ref(false);
const mobileOpen = ref(false);
const mounted = ref(false);
let lastY = 0;

const onScroll = () => {
  const y = window.scrollY;
  scrolled.value = y > 8;
  hidden.value = y > 96 && y > lastY && !mobileOpen.value;
  lastY = y;
};

const openSearch = () => window.dispatchEvent(new CustomEvent('rnp:open-search'));

watch(mobileOpen, (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : '';
});

onMounted(() => {
  mounted.value = true;
  lastY = window.scrollY;
  window.addEventListener('scroll', onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  document.documentElement.style.overflow = '';
});

const headerClass = computed(() => [
  'fixed inset-x-0 top-0 z-40 transition-transform duration-300 ease-out',
  hidden.value ? '-translate-y-full' : 'translate-y-0',
]);

/** True while the header floats over the home hero (bright/dark gradient). */
const isOverlay = computed(() => !!props.overlay && !scrolled.value);
</script>

<template>
  <header :class="[headerClass, isOverlay ? 'header-overlay' : '']">
    <div
      class="border-b transition-all duration-300"
      :class="
        scrolled
          ? 'border-line bg-background/85 shadow-[0_4px_24px_-12px_rgb(20_23_43/0.25)] backdrop-blur-md'
          : 'border-transparent bg-transparent'
      "
    >
      <div class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <a href="/" class="site-logo flex shrink-0 items-center gap-2.5" aria-label="RNP home">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 275.37 167.48" class="h-7 w-auto" aria-hidden="true">
            <path fill="#ffdc4a" d="M95.79,83.73a95.44,95.44,0,0,1,31.82-71.27,83.73,83.73,0,1,0,0,142.54A95.44,95.44,0,0,1,95.79,83.73Z" transform="translate(0.08 0.01)" />
            <path fill="#1a7bec" d="M179.46,83.73A95.44,95.44,0,0,1,147.6,155a83.73,83.73,0,1,0,0-142.54A95.44,95.44,0,0,1,179.46,83.73Z" transform="translate(0.08 0.01)" />
            <path fill="#00dfb7" d="M167.49,83.73a83.57,83.57,0,0,0-29.87-64,83.59,83.59,0,0,0,0,128.09A83.57,83.57,0,0,0,167.49,83.73Z" transform="translate(0.08 0.01)" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 387.41 172.4" class="h-[1.35rem] w-auto" fill="currentColor" aria-label="rnp">
            <path d="M27.3,3.19,29.48,17C38.67,2.23,51,0,63.12,0S87.33,4.84,93.86,11.38L80.55,37.08a29.5,29.5,0,0,0-21.31-7.74c-15.5,0-29.71,8.23-29.71,30.27v62.92H0V3.19Z" />
            <path d="M201.49,122.54V60.08c0-18.16-9.93-32-28.8-32-18.16,0-30.5,15.26-30.5,33.42v61H112.93V2.94h26.39l1.92,16.23C153.35,7.3,165.45,1.26,180.46,1.26c28.08,0,50.68,21.06,50.68,58.58v62.7Z" />
            <path d="M258,172.4V3.19h27.6l1.94,16.46C296.72,6.34,312.71.54,326.24.54,363,.54,387.41,27.89,387.41,63s-21.87,62.44-60.17,62.44c-12.58,0-31.23-3.88-39.71-17v63.91ZM358,62.94C358,44.29,345.39,29,324.08,29s-33.84,15.3-33.84,33.89S304,96.83,324.13,96.83,358,81.63,358,62.94Z" />
          </svg>
        </a>

        <nav class="hidden items-center gap-1 md:flex" aria-label="Primary">
          <a
            v-for="link in links"
            :key="link.href"
            :href="link.href"
            class="nav-link rounded-full px-3.5 py-1.5 font-sans text-[0.92rem] transition-colors"
            :class="{ active: isActive(link.href) }"
            :aria-current="isActive(link.href) ? 'page' : undefined"
          >
            {{ link.label }}
          </a>
        </nav>

        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="search-btn flex h-9 items-center gap-2 rounded-full border px-3 transition-colors"
            aria-label="Search the site"
            @click="openSearch"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span class="hidden font-mono text-xs lg:inline">⌘K</span>
          </button>
          <a
            href="https://github.com/rnpgp/rnp"
            class="icon-btn hidden h-9 w-9 items-center justify-center rounded-full transition-colors sm:flex"
            aria-label="RNP on GitHub"
          >
            <svg viewBox="0 0 16 16" class="h-[1.15rem] w-[1.15rem]" fill="currentColor" aria-hidden="true">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
            </svg>
          </a>
          <ThemeToggle />
          <button
            type="button"
            class="icon-btn flex h-9 w-9 items-center justify-center rounded-full transition-colors md:hidden"
            :aria-expanded="mobileOpen"
            aria-label="Open menu"
            @click="mobileOpen = true"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </header>

  <Teleport v-if="mounted" to="body">
    <Transition name="fade">
      <div v-if="mobileOpen" class="fixed inset-0 z-50 flex flex-col bg-background md:hidden">
        <div class="flex h-16 items-center justify-between border-b border-line px-6">
          <span class="mono-label">Menu</span>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:text-foreground"
            aria-label="Close menu"
            @click="mobileOpen = false"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-8" aria-label="Mobile">
          <a
            v-for="link in links"
            :key="link.href"
            :href="link.href"
            class="rounded-lg px-3 py-3 font-sans text-2xl transition-colors"
            :class="isActive(link.href) ? 'bg-surface-dim font-bold text-accent' : 'text-foreground hover:bg-surface-dim'"
            @click="mobileOpen = false"
          >
            {{ link.label }}
          </a>
          <div class="mt-auto pt-8">
            <a href="https://github.com/rnpgp/rnp" class="font-mono text-sm text-muted underline decoration-line underline-offset-4 hover:text-accent">
              github.com/rnpgp/rnp
            </a>
          </div>
        </nav>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
