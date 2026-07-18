<script setup lang="ts">
import { computed, ref } from 'vue';

interface Post {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  categories: string[];
  excerpt?: string;
}

const props = defineProps<{ posts: Post[] }>();

const activeCategory = ref('all');
const query = ref('');

const categories = computed(() => {
  const all = new Set<string>();
  for (const post of props.posts) {
    for (const category of post.categories) all.add(category);
  }
  return [...all].sort();
});

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return props.posts.filter((post) => {
    if (activeCategory.value !== 'all' && !post.categories.includes(activeCategory.value)) {
      return false;
    }
    if (q && !`${post.title} ${post.excerpt ?? ''}`.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });
});

// Posts arrive sorted newest-first; groups keep that order within each year.
const byYear = computed(() => {
  const groups = new Map<string, Post[]>();
  for (const post of filtered.value) {
    const year = post.date.slice(0, 4);
    const list = groups.get(year);
    if (list) list.push(post);
    else groups.set(year, [post]);
  }
  return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]));
});

const countLine = computed(() => {
  const n = filtered.value.length;
  if (!n) return '0 posts';
  const years = byYear.value.map(([year]) => year);
  const range =
    years.length > 1 ? `${years[years.length - 1]}\u2013${years[0]}` : years[0];
  return `${n} post${n === 1 ? '' : 's'} \u00B7 ${range}`;
});
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-x-6 gap-y-4">
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-full border px-4 py-1.5 font-mono text-sm transition-all"
          :class="
            activeCategory === 'all'
              ? 'border-accent bg-accent text-white'
              : 'border-line bg-surface text-muted hover:border-accent hover:text-accent'
          "
          @click="activeCategory = 'all'"
        >
          All
        </button>
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          class="rounded-full border px-4 py-1.5 font-mono text-sm transition-all"
          :class="
            activeCategory === category
              ? 'border-accent bg-accent text-white'
              : 'border-line bg-surface text-muted hover:border-accent hover:text-accent'
          "
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>
      <input
        v-model="query"
        type="search"
        placeholder="Filter posts…"
        aria-label="Filter posts"
        class="w-full rounded-lg border border-line bg-surface px-4 py-2 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-faint focus:border-accent sm:ml-auto sm:w-64"
      />
    </div>

    <p class="mono-label mt-8">{{ countLine }}</p>

    <template v-if="byYear.length">
      <section v-for="[year, posts] in byYear" :key="year" class="mt-10">
        <h2 class="mono-label border-b border-line pb-2">{{ year }}</h2>
        <div class="mt-2">
          <a
            v-for="post in posts"
            :key="post.id"
            :href="`/blog/${post.id}/`"
            class="group flex flex-wrap items-baseline gap-x-5 gap-y-1 px-4 py-3.5 -mx-4 rounded-lg transition-colors hover:bg-surface-dim"
          >
            <span class="shrink-0 font-mono text-sm text-faint">{{ post.date }}</span>
            <span
              class="shrink-0 rounded-full border border-line bg-surface-dim px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider text-accent2 group-hover:border-accent2/40"
            >
              {{ post.categories[0] ?? 'post' }}
            </span>
            <span class="font-sans text-lg font-bold transition-colors group-hover:text-accent">
              {{ post.title }}
            </span>
            <span
              v-if="post.excerpt"
              class="hidden md:block w-full text-sm text-muted leading-relaxed line-clamp-2"
            >
              {{ post.excerpt }}
            </span>
          </a>
        </div>
      </section>
    </template>
    <p v-else class="py-10 text-center text-muted">No posts match.</p>
  </div>
</template>
