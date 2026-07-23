<script setup lang="ts">
defineProps<{ input: string; hex: string }>();

const THUNDERBIRD_PATH =
  'M314.805 154.949H314.865C336.905 77.8991 432.945 40.2891 530.815 40.2891C598.445 40.2891 659.156 61.6991 700.776 95.6891C675.938 96.8603 651.414 101.734 628.016 110.149C661.646 122.649 690.535 141.879 711.945 165.669C695.792 162.889 679.413 161.65 663.026 161.969C703.302 220.312 724.82 289.554 724.706 360.449C724.706 553.749 568.005 710.449 374.705 710.449C184.385 710.449 24.7051 551.099 24.7051 360.449C24.7051 330.339 28.7051 299.249 36.4751 270.089C38.5151 263.969 41.3551 258.099 45.1251 255.949C49.8451 253.259 54.1451 261.279 54.8351 263.889C59.9528 283.059 66.839 301.712 75.4051 319.609C74.6551 279.649 91.7251 243.249 115.205 211.769C130.865 190.779 145.385 171.329 152.085 115.199C152.535 111.429 156.105 108.719 159.715 109.899C210.675 126.579 237.915 211.439 233.685 282.399C261.835 286.429 261.705 257.019 261.705 257.019C252.705 229.359 258.705 177.949 314.705 154.949H314.805Z';
</script>

<template>
  <div class="relative flex h-10 items-center">
    <div class="egg-bird flex items-center gap-3 whitespace-nowrap">
      <svg viewBox="0 0 750 750" class="egg-bird-icon h-7 w-7 text-accent" fill="currentColor" aria-hidden="true">
        <path :d="THUNDERBIRD_PATH" />
      </svg>
      <span class="font-mono text-sm text-accent">Powered by Thunderbird's wings.</span>
    </div>
  </div>
</template>

<style scoped>
.egg-bird {
  animation: bird-fly 2.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.egg-bird-icon {
  transform-origin: center;
  animation: bird-flap 0.28s ease-in-out infinite;
}
@keyframes bird-fly {
  0% { transform: translateX(-110%); }
  55% { transform: translateX(35%); }
  100% { transform: translateX(110%); }
}
@keyframes bird-flap {
  0%, 100% { transform: scaleY(1) rotate(0deg); }
  50% { transform: scaleY(0.7) rotate(-3deg); }
}
@media (prefers-reduced-motion: reduce) {
  .egg-bird, .egg-bird-icon { animation: none; }
}
</style>
