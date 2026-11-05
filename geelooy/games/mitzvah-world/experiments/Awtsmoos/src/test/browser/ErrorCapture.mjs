// B"H — Captures Chossid load error.
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { startBrowserProof } from './BrowserProofProcess.mjs';
import { fileURLToPath } from 'node:url';
const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const GAME_URL = '/geelooy/games/mitzvahWorld/index.html';
const processValue = await startBrowserProof(repositoryRoot);
const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
let targetId = null;
try {
  const target = await browser.targets.create();
  targetId = target.id;
  const errors = [];
  await browser.evaluate(targetId, `(() => {
    window.__errors = [];
    window.addEventListener('error', e => window.__errors.push(e.message));
    window.addEventListener('unhandledrejection', e => window.__errors.push('REJ:' + (e.reason?.message || e.reason)));
  })()`);
  await browser.navigateTarget(targetId, `${processValue.baseUrl}${GAME_URL}?t=${Date.now()}`);
  await browser.waitFor(targetId, `Boolean(document.querySelector('[data-world-id="living-village"]'))`, { intervalMs: 200, timeoutMs: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  await browser.evaluate(targetId, `document.querySelector('[data-world-id="living-village"]').click()`);
  await new Promise(r => setTimeout(r, 10000));
  const errs = await browser.evaluate(targetId, `window.__errors || []`).catch(() => []);
  console.log('ERRORS:' + JSON.stringify(errs.slice(0, 5)));
  const milestone = await browser.evaluate(targetId, `(() => {
    const s = globalThis.AwtsmoosMitzvahWorldEssentialBoot;
    return s?.milestones?.canonicalChossidDecoded || null;
  })()`).catch(() => null);
  console.log('MILESTONE:' + JSON.stringify(milestone));
  console.log('DONE');
} finally {
  if (targetId) await browser.closeTarget(targetId).catch(() => {});
  await browser.stop().catch(() => {});
  try { processValue.process?.kill?.(); } catch {}
  setTimeout(() => process.exit(0), 500);
}
