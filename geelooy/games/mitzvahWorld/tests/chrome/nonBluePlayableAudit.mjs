// B"H
/** Non-blue playable audit with runtime navigation fallback; no false about:blank victory or failure. */
import { findBrowser } from './ChromePath.js';
import { launchChrome } from './ChromeLauncher.js';
import { connectCdp } from './ChromeDevTools.js';

const repoRootUrl = process.env.MITZVAH_WORLD_URL || 'http://127.0.0.1:8080/games/mitzvahWorld/';
const targetUrl = `${repoRootUrl}?compact=true&path=village.json&awtsAudit=non-blue-${Date.now()}`;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function evaluate(client, expression, timeoutMs = 8000) {
  const result = await client.send('Runtime.evaluate', { expression, awaitPromise:true, returnByValue:true }, timeoutMs);
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed.');
  return result.result?.value;
}

async function ensureLocation(client) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const href = await evaluate(client, 'location.href', 3000).catch(() => '');
    if (String(href).includes('mitzvahWorld') && String(href).includes('path=village.json')) return href;
    if (attempt === 4 || String(href) === 'about:blank') {
      await evaluate(client, `window.location.assign(${JSON.stringify(targetUrl)}); true`, 3000).catch(() => null);
    }
    await sleep(250);
  }
  const href = await evaluate(client, 'location.href', 3000).catch(() => 'unknown');
  throw new Error(`Chrome did not enter Mitzvah World; href=${href}`);
}

async function waitForProof(client) {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const proof = await evaluate(client, `(() => {
      const fps = window.__AWTSMOOS_WORKER_GAMEPLAY_FPS__ || null;
      const c = document.querySelector('canvas');
      if (!c) return { ready:false, reason:'no-canvas', href:location.href, title:document.title };
      const tiny = document.createElement('canvas'); tiny.width = 64; tiny.height = 64;
      const ctx = tiny.getContext('2d'); ctx.drawImage(c, 0, 0, 64, 64);
      const data = ctx.getImageData(0, 0, 64, 64).data;
      const colors = new Set(); let nonBlue = 0;
      for (let i = 0; i < data.length; i += 16) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        colors.add(r + ',' + g + ',' + b);
        if (!(b > g && g > r && b > 120)) nonBlue += 1;
      }
      const hidden = !document.getElementById('awtsmoosLoadingVeil');
      const loading = window.__MITZVAH_LOADING_DIAG__?.()?.loading || null;
      return {
        ready:Boolean(hidden && fps?.renderInfo?.calls > 0 && fps?.renderBudget?.total?.visibleMeshes > 0 && nonBlue > 100 && colors.size > 20),
        hidden, url:location.href, title:document.title,
        canvas:{ width:c.width, height:c.height, colors:colors.size, nonBlue },
        fps:{ calls:fps?.renderInfo?.calls || 0, triangles:fps?.renderInfo?.triangles || 0, meshes:fps?.renderBudget?.total?.meshes || 0, visibleMeshes:fps?.renderBudget?.total?.visibleMeshes || 0, fps:fps?.fps || 0 },
        loading, hiddenProof:window.__AWTSMOOS_LOADING_HIDDEN_PROOF__ || null,
        hud:{ health:!!document.querySelector('[data-hud="health"]'), target:!!document.querySelector('[data-hud="targeting"]'), bar:!!document.querySelector('[data-hud="action-bar"]'), bag:!!document.querySelector('[data-hud-link="inventory-bag"]') }
      };
    })()`);
    if (proof.ready) return proof;
    await sleep(500);
  }
  return evaluate(client, `(() => ({ ready:false, reason:'timeout', href:location.href, title:document.title, text:(document.body?.innerText || '').slice(0, 400), loading:window.__MITZVAH_LOADING_DIAG__?.() || null, fps:window.__AWTSMOOS_WORKER_GAMEPLAY_FPS__ || null }))()`);
}

const browser = findBrowser();
if (!browser.path) throw new Error('No Chrome/Chromium browser found for nonBluePlayableAudit.');

const chrome = await launchChrome(browser.path, targetUrl, 9231, { width:390, height:844 });
const events = [];
try {
  const client = await connectCdp(chrome.page.webSocketDebuggerUrl, event => {
    if (['Runtime.exceptionThrown', 'Log.entryAdded', 'Network.loadingFailed'].includes(event.method)) events.push(event);
  });
  await client.send('Runtime.enable'); await client.send('Log.enable'); await client.send('Network.enable');
  await ensureLocation(client);
  const proof = await waitForProof(client);
  const bad = events.filter(event => event.method === 'Runtime.exceptionThrown' || event.method === 'Network.loadingFailed');
  if (!proof.ready || bad.length) {
    console.error(JSON.stringify({ ok:false, proof, bad:bad.slice(0, 5) }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok:true, test:'nonBluePlayableAudit', proof }, null, 2));
  client.close?.();
} finally { await chrome.close(); }
