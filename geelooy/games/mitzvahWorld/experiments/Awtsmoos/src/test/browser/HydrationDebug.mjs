// B"H — Debugs visual hydration outcome.
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
  await browser.navigateTarget(targetId, `${processValue.baseUrl}${GAME_URL}?t=${Date.now()}`);
  await browser.waitFor(targetId, `Boolean(document.querySelector('[data-world-id="living-village"]'))`, { intervalMs: 200, label: 'MENU', timeoutMs: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  await browser.evaluate(targetId, `document.querySelector('[data-world-id="living-village"]').click()`);
  await new Promise(r => setTimeout(r, 30000));
  const result = await browser.evaluate(targetId, `(() => {
    const resources = performance.getEntriesByType('resource');
    const tex = resources.filter(e => e.name.match(/texture|ground|grass|\.jpg|\.png|\.webp/i));
    return {
      totalResources: resources.length,
      textureLike: tex.map(e => ({ name: e.name.split('/').pop(), dur: Math.round(e.duration) })),
      // Check console for hydration warnings
    };
  })()`).catch(e => ({ error: String(e) }));
  console.log(JSON.stringify(result, null, 1));
  console.log('DONE');
} finally {
  if (targetId) await browser.closeTarget(targetId).catch(() => {});
  await browser.stop().catch(() => {});
  try { processValue.process?.kill?.(); } catch {}
  setTimeout(() => process.exit(0), 500);
}
