import type { EggDef } from './types';

import MatrixEgg from './eggs/MatrixEgg.vue';
import RedactedEgg from './eggs/RedactedEgg.vue';
import PanicEgg from './eggs/PanicEgg.vue';
import ThunderbirdEgg from './eggs/ThunderbirdEgg.vue';
import ArmorEgg from './eggs/ArmorEgg.vue';
import HalEgg from './eggs/HalEgg.vue';
import DaveEgg from './eggs/DaveEgg.vue';
import PqcEgg from './eggs/PqcEgg.vue';
import LibrepgpEgg from './eggs/LibrepgpEgg.vue';
import RiboseEgg from './eggs/RiboseEgg.vue';
import PrivacyEgg from './eggs/PrivacyEgg.vue';
import DhEgg from './eggs/DhEgg.vue';
import OtpEgg from './eggs/OtpEgg.vue';
import EnigmaEgg from './eggs/EnigmaEgg.vue';
import PhilEgg from './eggs/PhilEgg.vue';

/**
 * Each egg is one entry — trigger, duration, background, and the component that
 * renders inside the fingerprint box. Add a new egg by creating `eggs/FooEgg.vue`
 * and appending one entry here.
 */
export const EGG_REGISTRY: EggDef[] = [
  {
    name: 'matrix',
    trigger: /\b(matrix|neo|wake\s*up|mr\.?\s*anderson)\b/i,
    duration: 5000,
    background: 'border-emerald-500/40 bg-[#00150a]',
    component: MatrixEgg,
  },
  {
    name: 'redacted',
    trigger: /\b(snowden|nsa|prism|classified|top\s*secret|redact(ed)?)\b/i,
    duration: 5000,
    background: 'border-red-900/60 bg-black',
    component: RedactedEgg,
  },
  {
    name: 'panic',
    trigger: /\b(42|don'?t\s*panic|hitchhiker|arthur\s*dent)\b/i,
    duration: 5000,
    background: 'border-amber-500/50 bg-[#fdf6e3]',
    component: PanicEgg,
  },
  {
    name: 'thunderbird',
    trigger: /\bthunderbird\b/i,
    duration: 5000,
    background: 'border-line bg-surface-dim',
    component: ThunderbirdEgg,
  },
  {
    name: 'armor',
    trigger: /\b(pgp\s*message|ascii\s*armor|openpgp|4880)\b/i,
    duration: 5000,
    background: 'border-line bg-surface-dim',
    component: ArmorEgg,
  },
  {
    name: 'hal',
    trigger: /\b(hal(\s*9000)?|hal9000|9000|monolith|space\s*odyssey|2001)\b/i,
    duration: 9000,
    background: 'border-[#ff1744]/40 bg-[#1a0606]',
    component: HalEgg,
    sceneEvent: 'halScene',
  },
  {
    name: 'dave',
    trigger: /\b(dave(\s*bowman)?|bowman|pod\s*bay\s*doors?)\b/i,
    duration: 11000,
    background: 'border-cyan-900/50 bg-[#040810]',
    component: DaveEgg,
    sceneEvent: 'daveScene',
  },
  {
    name: 'pqc',
    trigger: /\b(pqc|post[-\s]*quantum|quantum|9980)\b/i,
    duration: 5000,
    background: 'border-cyan-500/40 bg-[#061a1f]',
    component: PqcEgg,
  },
  {
    name: 'librepgp',
    trigger: /\blibrepgp\b/i,
    duration: 5000,
    background:
      'border-gold/50 bg-[color-mix(in_oklab,var(--gold)_14%,var(--surface-dim))]',
    component: LibrepgpEgg,
  },
  {
    name: 'ribose',
    trigger: /\bribose\b/i,
    duration: 5000,
    background: 'border-line bg-surface-dim',
    component: RiboseEgg,
  },
  {
    name: 'privacy',
    trigger: /\bprivacy\b/i,
    duration: 5000,
    background: 'border-line bg-surface-dim',
    component: PrivacyEgg,
  },
  {
    name: 'dh',
    trigger: /\b(dh|diffie[\s-]*hellman)\b/i,
    duration: 6000,
    background: 'border-purple-500/40 bg-[#0e0420]',
    component: DhEgg,
  },
  {
    name: 'otp',
    trigger: /\b(otp|one[\s-]*time[\s-]*pad|vernam)\b/i,
    duration: 6000,
    background: 'border-emerald-500/40 bg-[#021810]',
    component: OtpEgg,
  },
  {
    name: 'enigma',
    trigger: /\benigma\b/i,
    duration: 6000,
    background: 'border-gray-500/40 bg-[#0a0a0c]',
    component: EnigmaEgg,
  },
  {
    name: 'phil',
    trigger: /\b(phil|zimmermann|munitions?)\b/i,
    duration: 6000,
    background: 'border-amber-700/40 bg-[#f5edd6]',
    component: PhilEgg,
  },
];
