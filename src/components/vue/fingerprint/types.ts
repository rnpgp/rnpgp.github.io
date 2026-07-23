import type { Component } from 'vue';

export type EggName =
  | 'matrix'
  | 'redacted'
  | 'panic'
  | 'thunderbird'
  | 'armor'
  | 'hal'
  | 'dave'
  | 'pqc'
  | 'librepgp'
  | 'ribose'
  | 'privacy'
  | 'dh'
  | 'otp'
  | 'enigma'
  | 'phil';

export interface EggProps {
  /** Current input value (some eggs read it, e.g. otp). */
  input: string;
  /** Current SHA-256 hex (some eggs read it, e.g. armor). */
  hex: string;
}

export interface EggDef {
  name: EggName;
  /** Input value is tested against this regex to trigger the egg. */
  trigger: RegExp;
  /** How long the egg stays active before auto-clearing (ms). */
  duration: number;
  /** Tailwind classes applied to the fingerprint box while this egg is active. */
  background: string;
  /** Vue component rendered inside the box. */
  component: Component;
  /** If set, dispatch this event when the egg fires (screenwide scene). */
  sceneEvent?: 'halScene' | 'daveScene';
}
