// B"H — Quick movement verification v2 (correct property names).
import { BrowserCdpHarness } from './BrowserCdpHarness.mjs';
import { startBrowserProof } from './BrowserProofProcess.mjs';
import { fileURLToPath } from 'node:url';
const repositoryRoot = fileURLToPath(new URL('../../../../../../../../', import.meta.url));
const GAME_URL = '/geelooy/games/mitzvahWorld/index.html';
const processValue = await startBrowserProof(repositoryRoot);
const browser = await new BrowserCdpHarness(processValue.cdpPort).start();
let targetId = null;
const SNIPPET = `(() => {
  const s = globalThis.AwtsmoosMitzvahWorldEssentialBoot;
  if (!s) return null;
  const out = { certified: s.certified, milestones: {} };
  for (const [k, m] of Object.entries(s.milestones || {})) out.milestones[k] = m.status + '@' + Math.round(m.elapsedMilliseconds || 0);
  return out;
})()`;
try {
  const target = await browser.targets.create();
  targetId = target.id;
  await browser.navigateTarget(targetId, `${processValue.baseUrl}${GAME_URL}?t=${Date.now()}`);
  await browser.waitFor(targetId, `Boolean(document.querySelector('[data-world-id="living-village"]'))`, { intervalMs: 200, label: 'MENU', timeoutMs: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  await browser.evaluate(targetId, `document.querySelector('[data-world-id="living-village"]').click()`);
  const t0 = Date.now();
  let last = '';
  while (Date.now() - t0 < 25000) {
    const snap = await browser.evaluate(targetId, SNIPPET).catch(() => null);
    if (snap) {
      const sig = JSON.stringify(snap.milestones);
      if (sig !== last) { last = sig; console.log('SNAP', Date.now() - t0, sig, 'cert=' + snap.certified); }
      if (snap.certified) break;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('DONE');
} finally {
  if (targetId) await browser.closeTarget(targetId).catch(() => {});
  await browser.stop().catch(() => {});
  try { processValue.process?.kill?.(); } catch {}
  setTimeout(() => process.exit(0), 500);
}
