<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const props = withDefaults(defineProps<{ delay?: number }>(), { delay: 0 });

const el = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (!el.value) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.value.classList.add('is-visible');
    return;
  }
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          el.value?.classList.add('is-visible');
          observer?.disconnect();
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );
  observer.observe(el.value);
});

onUnmounted(() => observer?.disconnect());
</script>

<template>
  <div ref="el" class="reveal" :style="props.delay ? { transitionDelay: `${props.delay}ms` } : undefined">
    <slot />
  </div>
</template>
