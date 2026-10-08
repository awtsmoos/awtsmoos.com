//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Layer 8 (Device Matrix) of the Airtight CSS Guarantee System.
 * @description Post-deploy verification across devices. Extends the
 * `scripts/css-gate/run.js` probe convention — each matrix entry feeds
 * `{ url, width, height }` into the tunnel `cssImmediateIssues` action,
 * with theme/lang carried as URL query params (`?theme=dark&lang=he`)
 * so the live page renders under that theme and language before probing.
 * The cartesian plan (devices × theme/lang × pages) is what a runner
 * iterates; screenshot comparison is a marked STUB until a real
 * pixel-diff implementation lands (see compareScreenshots).
 */

/**
 * Devices the CSS guarantee is verified against after every deploy.
 * @type {Array<{name: string, width: number, height: number, userAgent: string}>}
 */
export const DEVICE_MATRIX = [
  {
    name: 'Desktop Chrome 1920x1080',
    width: 1920,
    height: 1080,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  },
  {
    name: 'Desktop Firefox 1920x1080',
    width: 1920,
    height: 1080,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
  },
  {
    name: 'iOS Safari 375x667',
    width: 375,
    height: 667,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  },
  {
    name: 'Android Chrome 360x640',
    width: 360,
    height: 640,
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  },
  {
    name: 'iPad 768x1024',
    width: 768,
    height: 1024,
    userAgent:
      'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  },
];

/**
 * Theme × language combinations. The old "both" language mode is covered
 * by probing he + en separately; nothing ships unprobed in a single mode.
 * @type {Array<{theme: 'light'|'dark', lang: 'he'|'en'}>}
 */
export const THEME_LANG_COMBOS = [
  { theme: 'light', lang: 'he' },
  { theme: 'light', lang: 'en' },
  { theme: 'dark', lang: 'he' },
  { theme: 'dark', lang: 'en' },
];

/**
 * Builds the full verification plan: every device × every theme/lang combo
 * × every page path.
 *
 * Each entry's `url` carries `?theme=<theme>&lang=<lang>` so the page
 * renders under that theme and language; a probe runner then calls
 * `cssImmediateIssues` with `{ url, width: device.width, height: device.height }`,
 * exactly like `scripts/css-gate/run.js` does with its own --url/--width/--height.
 *
 * @param {string} baseUrl Site origin, e.g. 'https://awtsmoos.com' (trailing slash ok).
 * @param {string[]} pages Page paths, e.g. ['/heichelos/ikar/series/meluket-vol1/post/xyz'].
 * @returns {Array<{url: string, device: object, theme: string, lang: string, label: string}>}
 *   One entry per device × combo × page (devices.length × combos.length × pages.length).
 */
export function planMatrix(baseUrl, pages) {
  const origin = String(baseUrl).replace(/\/+$/, '');
  const plan = [];
  for (const page of pages) {
    const path = String(page).startsWith('/') ? String(page) : '/' + String(page);
    for (const device of DEVICE_MATRIX) {
      for (const { theme, lang } of THEME_LANG_COMBOS) {
        plan.push({
          url: `${origin}${path}?theme=${theme}&lang=${lang}`,
          device,
          theme,
          lang,
          label: `${device.name} · ${theme}/${lang} · ${path}`,
        });
      }
    }
  }
  return plan;
}

/**
 * STUB — compares two PNG screenshots and reports a 0–100 difference score.
 *
 * ⚠️ STUB IMPLEMENTATION: this does NOT decode PNG pixels. It compares
 * buffer lengths plus an even byte-sample across both buffers and blends
 * the two ratios into a 0–100 score. Two visually different screenshots
 * can score 0 here, and two identical renders can score non-zero if the
 * PNG encoder emits different bytes. The interface ({diffPercent}) is
 * what matters; the body must be replaced by a real pixel diff.
 *
 * A production implementation needs:
 *  - a PNG decoder (pngjs or the browser's ImageBitmap / canvas),
 *  - per-pixel RGBA comparison with a tolerance for antialiasing
 *    (exact-match fails on font rasterization differences),
 *  - normalization for devicePixelRatio and viewport size mismatches
 *    (resize/smaller-of-the-two before comparing),
 *  - ignore-regions for dynamic content (timestamps, carousels),
 *  - a real diff image output for human review.
 *
 * @param {Buffer|Uint8Array} baselinePng Reference screenshot bytes.
 * @param {Buffer|Uint8Array} currentPng Screenshot bytes under test.
 * @returns {{diffPercent: number}} 0 = no detected difference, 100 = completely different.
 */
export function compareScreenshots(baselinePng, currentPng) {
  const a = Buffer.isBuffer(baselinePng) ? baselinePng : Buffer.from(baselinePng || []);
  const b = Buffer.isBuffer(currentPng) ? currentPng : Buffer.from(currentPng || []);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return { diffPercent: 0 };

  // Length component: captures gross size changes.
  const lenDiff = Math.abs(a.length - b.length) / maxLen;

  // Byte-sample component: even sample of up to 4096 bytes over the overlap.
  const minLen = Math.min(a.length, b.length);
  const SAMPLES = 4096;
  let mismatches = 0;
  let samples = 0;
  for (let i = 0; i < SAMPLES && i < minLen; i++) {
    const idx = Math.floor((i / SAMPLES) * minLen);
    samples++;
    if (a[idx] !== b[idx]) mismatches++;
  }
  const byteDiff = samples > 0 ? mismatches / samples : 0;

  const diffPercent = Math.min(100, Math.max(0, 100 * (0.5 * lenDiff + 0.5 * byteDiff)));
  return { diffPercent };
}
