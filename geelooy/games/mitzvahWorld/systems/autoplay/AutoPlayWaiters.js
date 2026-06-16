// B"H
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function waitUntil(name, predicate, options = {}) {
  const timeoutMs = options.timeoutMs || 30000;
  const intervalMs = options.intervalMs || 250;
  const started = Date.now();
  let lastValue;
  while (Date.now() - started < timeoutMs) {
    try {
      lastValue = await predicate();
      if (lastValue) return { ok: true, name, value: lastValue, elapsedMs: Date.now() - started };
    } catch (error) { lastValue = { error: error.message || String(error) }; }
    await sleep(intervalMs);
  }
  return { ok: false, name, value: lastValue, elapsedMs: Date.now() - started };
}

export async function waitForDomReady() {
  if (document.readyState !== 'loading') return { ok: true };
  await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
  return { ok: true };
}

export async function waitForCanvas(timeoutMs = 45000) {
  return waitUntil('canvas', () => document.querySelector('canvas'), { timeoutMs });
}

export async function waitForBootEvidence(timeoutMs = 60000) {
  return waitUntil('boot-evidence', () => {
    const evidence = {
      canvas: Boolean(document.querySelector('canvas')),
      loaded: Boolean(window.__AWTSMOOS_BOOT_LOADED__ || window.mana || window.__AWTSMOOS_OLAM__),
      error: window.__AWTSMOOS_LAST_ERROR__ || null
    };
    return evidence.canvas || evidence.loaded || evidence.error ? evidence : false;
  }, { timeoutMs, intervalMs: 500 });
}

export async function waitForPlayableWorld(timeoutMs = 120000) {
  return waitUntil('playable-world', () => {
    const vitals = collectVitals();
    const loadingText = /Drawing Down|Opening the world|waiting|\b\d+%\b/i.test(vitals.bodyText);
    const hasHud = /Chossid|HP|Progress|Shlichus Tracker/i.test(vitals.bodyText);
    const playable = vitals.canvasCount > 0 && vitals.bootLoaded && !vitals.bootError && hasHud && !loadingText;
    return playable ? { playable, vitals } : false;
  }, { timeoutMs, intervalMs: 1000 });
}

export function collectVitals() {
  return {
    href: location.href,
    readyState: document.readyState,
    canvasCount: document.querySelectorAll('canvas').length,
    bodyText: document.body.innerText.slice(0, 1200),
    bootLoaded: Boolean(window.__AWTSMOOS_BOOT_LOADED__),
    bootError: window.__AWTSMOOS_LAST_ERROR__ || null,
    vehicles: window.__MITZVAH_VEHICLES__?.status || Boolean(window.__MITZVAH_VEHICLES__)
  };
}
