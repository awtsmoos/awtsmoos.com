// B"H — Checks for failed resources and hydration state.
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
  await new Promise(r => setTimeout(r, 40000));
  const result = await browser.evaluate(targetId, `(() => {
    const all = performance.getEntriesByType('resource');
    // Find failed (no response or error)
    const failed = all.filter(e => e.transferSize === 0 && e.decodedBodySize === 0 && e.duration > 1000);
    // Find drive/texture URLs
    const driveUrls = all.filter(e => e.name.includes('drive') || e.name.includes('texture')).slice(0, 10);
    return {
      failedCount: failed.length,
      failedNames: failed.slice(0, 5).map(e => e.name.split('/').pop().substring(0, 60)),
      driveUrls: driveUrls.map(e => ({ name: e.name.split('/').pop().substring(0, 60), dur: Math.round(e.duration) }))
    };
  })()`).catch(e => ({ error: String(e).substring(0, 100) }));
  console.log('RESULT:' + JSON.stringify(result));
  console.log('DONE');
} finally {
  if (targetId) await browser.closeTarget(targetId).catch(() => {});
  await browser.stop().catch(() => {});
  try { processValue.process?.kill?.(); } catch {}
  setTimeout(() => process.exit(0), 500);
}
