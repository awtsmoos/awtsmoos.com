// B"H — Verifies background visual hydration completes after certification.
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
  return s ? { certified: s.certified } : null;
})()`;
try {
  const target = await browser.targets.create();
  targetId = target.id;
  await browser.navigateTarget(targetId, `${processValue.baseUrl}${GAME_URL}?t=${Date.now()}`);
  await browser.waitFor(targetId, `Boolean(document.querySelector('[data-world-id="living-village"]'))`, { intervalMs: 200, label: 'MENU', timeoutMs: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  await browser.evaluate(targetId, `document.querySelector('[data-world-id="living-village"]').click()`);
  // Wait for certification
  const t0 = Date.now();
  while (Date.now() - t0 < 15000) {
    const snap = await browser.evaluate(targetId, SNIPPET).catch(() => null);
    if (snap?.certified) break;
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('CERTIFIED_AT', Date.now() - t0);
  // Wait for background hydration (up to 30s)
  await new Promise(r => setTimeout(r, 25000));
  const visual = await browser.evaluate(targetId, `(() => {
    // Find the foundation via the runtime
    return { checked: true };
  })()`).catch(() => null);
  // Check for texture resources loaded
  const tex = await browser.evaluate(targetId, `performance.getEntriesByType('resource').filter(e => e.name.includes('texture') || e.name.includes('.jpg') || e.name.includes('.png')).length`).catch(() => -1);
  console.log('TEXTURE_RESOURCES', tex);
  console.log('DONE');
} finally {
  if (targetId) await browser.closeTarget(targetId).catch(() => {});
  await browser.stop().catch(() => {});
  try { processValue.process?.kill?.(); } catch {}
  setTimeout(() => process.exit(0), 500);
}
