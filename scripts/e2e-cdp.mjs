#!/usr/bin/env node
/**
 * Interactive end-to-end tests: drives headless Chrome via the DevTools
 * Protocol (no dependencies) against a running preview server.
 *
 *   node scripts/e2e-cdp.mjs [baseUrl]     # default http://localhost:4325
 *
 * Verifies: page loads without console errors, hero, SHA-256 fingerprint
 * widget correctness, theme toggle, install tabs, Cmd+K Pagefind search,
 * blog filtering, advisory/man-page rendering, OpenPGP key cards.
 */
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, rmSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:4325';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DEBUG_PORT = 9223;
const PROFILE = '/tmp/rnp-e2e-profile';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

/* ---------- minimal CDP client ---------- */
let ws;
let msgId = 0;
const pending = new Map();
const consoleErrors = [];
const exceptions = [];

function cdpSend(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const res = await cdpSend('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    throw new Error(
      `evaluate failed: ${JSON.stringify(res.exceptionDetails.exception?.description ?? res.exceptionDetails.text)}\n  in: ${expression.slice(0, 140)}`,
    );
  }
  return res.result?.value;
}

async function navigate(url) {
  consoleErrors.length = 0;
  exceptions.length = 0;
  await cdpSend('Page.navigate', { url });
  await sleep(2600); // load + island hydration
}

/* ---------- boot chrome ---------- */
rmSync(PROFILE, { recursive: true, force: true });
mkdirSync(PROFILE, { recursive: true });
const chrome = spawn(
  CHROME,
  [
    '--headless',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${PROFILE}`,
    '--no-first-run',
    '--disable-gpu',
    '--window-size=1440,1000',
    'about:blank',
  ],
  { stdio: 'ignore' },
);
process.on('exit', () => chrome.kill('SIGKILL'));

let targets = null;
for (let i = 0; i < 40; i++) {
  await sleep(250);
  try {
    const res = await fetch(`http://localhost:${DEBUG_PORT}/json/list`);
    targets = await res.json();
    if (targets.some((t) => t.type === 'page')) break;
  } catch {
    /* retry */
  }
}
const page = targets.find((t) => t.type === 'page');
if (!page) {
  console.error('Could not connect to headless Chrome');
  process.exit(2);
}

ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id).resolve(msg.result ?? {});
    pending.delete(msg.id);
  } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    consoleErrors.push(msg.params.args?.map((a) => a.value ?? a.description).join(' '));
  } else if (msg.method === 'Runtime.exceptionThrown') {
    exceptions.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
  }
};

await cdpSend('Runtime.enable');
await cdpSend('Page.enable');

/* ---------- expected values ---------- */
const expectedFp = createHash('sha256').update('LibrePGP').digest('hex').toUpperCase();

/* ---------- HOME ---------- */
await navigate(`${BASE}/`);
check('home: title is RNP', (await evaluate('document.title')) === 'RNP');
check(
  'home: hero headline settled',
  (await evaluate("document.querySelector('h1')?.textContent?.replace(/\\s+/g, ' ')")).includes(
    'Powering end-to-end email encryption in Mozilla Thunderbird.',
  ),
);
check(
  'home: hero headline links to thunderbird.net',
  (await evaluate("document.querySelector('h1 a')?.href ?? ''")).includes('thunderbird.net'),
);
check(
  'home: hero is the brand gradient',
  await evaluate(`(() => {
    const bg = getComputedStyle(document.querySelector('section')).backgroundImage;
    return bg.includes('linear-gradient') && (bg.includes('26, 123, 236') || bg.includes('26,123,236'));
  })()`),
);
// overlay header: white text while floating over the hero (before scrolling)
const navColor = await evaluate(`getComputedStyle(document.querySelector('nav a')).color`);
check('home: overlay header nav text is white over hero', navColor.startsWith('rgba(255, 255, 255'), navColor);
const logoColor = await evaluate(`getComputedStyle(document.querySelector('.site-logo')).color`);
check('home: overlay header logo is white over hero', logoColor === 'rgb(255, 255, 255)', logoColor);

// fingerprint widget (scroll into view to trigger client:visible hydration)
await evaluate(`document.querySelector('#fp-input')?.scrollIntoView({ block: 'center' })`);
await sleep(1200);
const fpText = await evaluate(
  `document.querySelector('.fingerprint')?.textContent?.replace(/\\s+/g, '') ?? ''`,
);
check('home: fingerprint widget computes SHA-256("LibrePGP")', fpText === expectedFp, fpText.slice(0, 16) + '…');

// type a different message
await evaluate(`(() => {
  const el = document.querySelector('#fp-input');
  el.value = 'abc';
  el.dispatchEvent(new Event('input', { bubbles: true }));
})()`);
await sleep(700);
const fpAbc = await evaluate(
  `document.querySelector('.fingerprint')?.textContent?.replace(/\\s+/g, '') ?? ''`,
);
const expectedAbc = createHash('sha256').update('abc').digest('hex').toUpperCase();
check('home: fingerprint widget recomputes on input (SHA-256 test vector "abc")', fpAbc === expectedAbc);

// theme toggle
const themeBefore = await evaluate(`document.documentElement.classList.contains('dark')`);
await evaluate(`document.querySelector('button[aria-label^="Theme:"]')?.click()`);
await sleep(300);
const themeAfter = await evaluate(`document.documentElement.classList.contains('dark')`);
check('home: theme toggle flips .dark class', themeBefore !== themeAfter, `${themeBefore} → ${themeAfter}`);
await evaluate(`document.querySelector('button[aria-label^="Theme:"]')?.click()`); // cycle on

// install tabs
await evaluate(`document.querySelector('.card [role="tablist"]')?.scrollIntoView({ block: 'center' })`);
await sleep(800);
await evaluate(`[...document.querySelectorAll('[role="tab"]')].find(b => b.textContent.trim() === 'Nix')?.click()`);
await sleep(300);
check(
  'home: install tabs switch to Nix',
  (await evaluate(`document.querySelector('.card .bg-navy')?.textContent ?? ''`)).includes('nix-env -iA nixpkgs.rnp'),
);

// search modal
await evaluate(`window.dispatchEvent(new CustomEvent('rnp:open-search'))`);
await sleep(1500);
const searchReady = await evaluate(`!!document.querySelector('[role="dialog"] input[type="search"]')`);
check('home: search modal opens', searchReady);
await evaluate(`(() => {
  const el = document.querySelector('[role="dialog"] input[type="search"]');
  el.value = '0.18';
  el.dispatchEvent(new Event('input', { bubbles: true }));
})()`);
await sleep(1500);
const resultCount = await evaluate(
  `document.querySelectorAll('[role="dialog"] ul li a').length`,
);
check('home: Pagefind returns results for "0.18"', resultCount > 0, `${resultCount} result(s)`);
const firstResult = await evaluate(
  `document.querySelector('[role="dialog"] ul li a')?.getAttribute('href') ?? ''`,
);
check('home: first search result is a valid internal link', firstResult.startsWith('/'), firstResult);
await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`);
await sleep(300);

/* ---------- BLOG ---------- */
await navigate(`${BASE}/blog/`);
await evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.trim().toLowerCase() === 'news')?.click()`);
await sleep(400);
const newsRows = await evaluate(`document.querySelectorAll('main a[href^="/blog/"]').length`);
check('blog: category filter "news" shows exactly the LibrePGP post', newsRows === 1, `${newsRows} row(s)`);
await evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.trim().toLowerCase() === 'all')?.click()`);
await sleep(400);
const allRows = await evaluate(`document.querySelectorAll('main a[href^="/blog/"]').length`);
check('blog: "All" shows every post', allRows === 19, `${allRows} row(s)`);

/* ---------- BLOG POST ---------- */
await navigate(`${BASE}/blog/2025-11-20-rnp-release-0-18-1/`);
check(
  'post: title + asciidoc body rendered',
  (await evaluate(`document.querySelector('h1')?.textContent`)).includes('0.18.1') &&
    (await evaluate(`document.querySelector('.prose')?.textContent?.length ?? 0`)) > 2000,
);

/* ---------- ADVISORY ---------- */
await navigate(`${BASE}/advisories/ri-2021-001/`);
check(
  'advisory: CVE metadata rendered',
  (await evaluate(`document.body.textContent`)).includes('CVE-2021-33589'),
);

/* ---------- MAN PAGE ---------- */
await navigate(`${BASE}/docs/rnp-1/`);
check(
  'manpage: rnp(1) rendered with version',
  (await evaluate(`document.querySelector('h1')?.textContent`)).includes('rnp(1)') &&
    (await evaluate(`document.body.textContent`)).includes('0.18.1'),
);

/* ---------- DOCS (embedded) ---------- */
await navigate(`${BASE}/software/rnp/docs/installation/`);
check(
  'docs: embedded installation guide rendered',
  (await evaluate(`document.querySelector('.prose')?.textContent ?? ''`)).includes('brew install rnp'),
);

/* ---------- OPENPGP KEYS ---------- */
await navigate(`${BASE}/openpgp_keys/`);
await evaluate(`document.querySelector('.fingerprint')?.scrollIntoView({ block: 'center' })`);
await sleep(1000);
const keyFp = await evaluate(`document.querySelector('.fingerprint')?.textContent ?? ''`);
check('keys: release key fingerprint card rendered', keyFp.includes('31AF 5A24 D861'));

/* ---------- console health ---------- */
const seriousErrors = [...consoleErrors, ...exceptions].filter(
  (e) => e && !e.includes('favicon') && !e.includes('net::ERR_ABORTED'),
);
check('all pages: zero console errors / exceptions', seriousErrors.length === 0, seriousErrors.slice(0, 3).join(' | '));

/* ---------- summary ---------- */
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
chrome.kill('SIGKILL');
process.exit(failed.length ? 1 : 0);
