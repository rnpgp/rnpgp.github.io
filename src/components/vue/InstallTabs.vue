<script setup lang="ts">
import { computed, ref } from 'vue';
import CopyButton from './CopyButton.vue';

interface InstallTab {
  id: string;
  label: string;
  note: string;
  lines: string[];
}

const tabs: InstallTab[] = [
  {
    id: 'macos',
    label: 'macOS',
    note: 'via Homebrew',
    lines: ['brew tap rnpgp/rnp', 'brew install rnp'],
  },
  {
    id: 'nix',
    label: 'Nix',
    note: 'nixpkgs',
    lines: ['nix-env -iA nixpkgs.rnp'],
  },
  {
    id: 'rhel',
    label: 'RHEL / CentOS',
    note: 'via YUM',
    lines: [
      'rpm --import https://github.com/riboseinc/yum/raw/master/ribose-packages.pub',
      'curl -L https://github.com/riboseinc/yum/raw/master/ribose.repo > /etc/yum.repos.d/ribose.repo',
      'yum install -y rnp',
    ],
  },
  {
    id: 'source',
    label: 'From source',
    note: 'CMake · requires Botan 3',
    lines: [
      'git clone --recurse-submodules https://github.com/rnpgp/rnp.git',
      'cmake -S rnp -B rnp-build -DBUILD_SHARED_LIBS=on -DBUILD_TESTING=off',
      'cmake --build rnp-build',
      'sudo cmake --install rnp-build',
    ],
  },
];

const active = ref('macos');
const current = computed(() => tabs.find((t) => t.id === active.value) ?? tabs[0]);
const commandText = computed(() => current.value.lines.join('\n'));
</script>

<template>
  <div>
    <div class="flex flex-wrap gap-2" role="tablist" aria-label="Installation methods">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="active === tab.id"
        class="rounded-full border px-4 py-1.5 font-mono text-sm transition-all"
        :class="
          active === tab.id
            ? 'border-accent bg-accent text-white shadow-[0_4px_16px_-4px_var(--accent)]'
            : 'border-line bg-surface text-muted hover:border-accent hover:text-accent'
        "
        @click="active = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="mt-4 overflow-hidden rounded-lg border border-white/10 bg-navy shadow-lift">
      <div class="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-gold"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-teal"></span>
          <span class="ml-3 font-mono text-xs text-white/50">{{ current.note }}</span>
        </div>
        <CopyButton :text="commandText" dark />
      </div>
      <div class="overflow-x-auto p-4 font-mono text-[0.85rem] leading-relaxed text-[#e8eaf2]">
        <div v-for="(line, i) in current.lines" :key="i" class="flex">
          <span class="mr-3 select-none text-teal" aria-hidden="true">$</span>
          <span class="whitespace-pre">{{ line }}</span>
        </div>
      </div>
    </div>

    <p class="mt-3 font-mono text-xs text-faint">
      More platforms (Windows, Ubuntu, FreeBSD) in the
      <a href="/software/rnp/docs/installation/" class="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent">installation guide</a>.
    </p>
  </div>
</template>
