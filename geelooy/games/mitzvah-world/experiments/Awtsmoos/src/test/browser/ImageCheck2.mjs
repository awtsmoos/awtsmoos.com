// B"H — Checks for loaded image textures (simple string matching).
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
  await browser.waitFor(targetId, `Boolean(document.querySelector('[data-world-id="living-village"]'))`, { intervalMs: 200, timeoutMs: 15000 });
  await new Promise(r => setTimeout(r, 3000));
  await browser.evaluate(targetId, `document.querySelector('[data-world-id="living-village"]').click()`);
  await new Promise(r => setTimeout(r, 35000));
  const imgs = await browser.evaluate(targetId, `(() => {
    const all = performance.getEntriesByType('resource');
    const images = all.filter(e => {
      const n = e.name.toLowerCase();
      return e.initiatorType === 'img' || n.includes('.jpg') || n.includes('.png') || n.includes('.webp');
    });
    return { count: images.length, names: images.slice(0, 15).map(e => e.name.split('/').pop().substring(0, 60)) };
  })()`).catch(e => ({ error: String(e).substring(0, 100) }));
  console.log('IMAGES:' + JSON.stringify(imgs));
  console.log('DONE');
} finally {
  if (targetId) await browser.closeTarget(targetId).catch(() => {});
  await browser.stop().catch(() => {});
  try { processValue.process?.kill?.(); } catch {}
  setTimeout(() => process.exit(0), 500);
}
