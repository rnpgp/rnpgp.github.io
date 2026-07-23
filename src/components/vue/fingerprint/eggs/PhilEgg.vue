<script setup lang="ts">
defineProps<{ input: string; hex: string }>();
</script>

<template>
  <div class="text-center">
    <div class="phil-stamp egg-stamp-phil">
      <span class="phil-stamp-text">Munition</span>
      <span class="phil-stamp-sub">ITAR · US Customs · 1993–1996</span>
    </div>
    <p class="mt-3 font-mono text-[0.65rem] text-[#5a3a0a]">
      PGP was a weapon. Zimmermann under investigation for 3 years.
    </p>
  </div>
</template>

<style scoped>
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
  .egg-stamp-phil { animation: none; }
}
</style>
