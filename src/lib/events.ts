/**
 * Central registry of window custom-event names used by Vue islands.
 *
 * Importing from here lets TypeScript flag typos and gives a single rename
 * site per event. Both senders and listeners reference the same symbol.
 */

export const RNP_EVENTS = {
  /** SiteHeader → SiteSearch: open the Cmd+K modal. */
  openSearch: 'rnp:open-search',
  /** FingerprintPlayground or EasterEggs → EasterEggs: full-screen oracle rain. */
  hexRain: 'rnp:hex-rain',
  /** FingerprintPlayground → EasterEggs: play the HAL 9000 scene. */
  halScene: 'rnp:hal-scene',
  /** FingerprintPlayground → EasterEggs: play the Dave Bowman scene. */
  daveScene: 'rnp:dave-scene',
  /** FingerprintPlayground or EasterEggs → HeroDecrypt: scramble to readable. */
  replayHero: 'rnp:replay-hero',
  /** FingerprintPlayground or EasterEggs → HeroDecrypt: readable to scrambled. */
  encryptHero: 'rnp:encrypt-hero',
} as const;

/** sessionStorage keys (distinct from custom-event names). */
export const RNP_STORAGE = {
  helpHinted: 'rnp:help-hinted',
} as const;

/** Dispatch a registered event with no payload. */
export function dispatch(name: (typeof RNP_EVENTS)[keyof typeof RNP_EVENTS]): void {
  window.dispatchEvent(new CustomEvent(name));
}
