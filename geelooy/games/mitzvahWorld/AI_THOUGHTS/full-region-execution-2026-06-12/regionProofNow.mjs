// B"H
/** Compact runtime proof probe: no giant logs, no long wait. */
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9341;
const root = process.cwd().replaceAll('\\', '/');
const userDataDir = `${root}/.awtsmoos-tmp/region-proof-now-${Date.now()}`;
const url = 'http://127.0.0.1:8080/games/mitzvahWorld/?path=village.json&v=region-proof-now-bh2';
let id = 0;
function send(ws, method, params = {}) {
  const messageId = ++id;
  ws.send(JSON.stringify({ id: messageId, method, params }));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 18000);
    const handler = event => {
      const data = JSON.parse(event.data.toString());
      if (data.id !== messageId) return;
      clearTimeout(timer); ws.removeEventListener('message', handler);
      data.error ? reject(new Error(JSON.stringify(data.error))) : resolve(data.result);
    };
    ws.addEventListener('message', handler);
  });
}
async function fetchJson(endpoint, options = {}) { const r = await fetch(endpoint, options); if (!r.ok) throw new Error(`${r.status} ${endpoint}`); return r.json(); }
async function waitForChrome() { for (let i = 0; i < 60; i++) { try { return await fetchJson(`http://127.0.0.1:${port}/json/version`); } catch { await wait(180); } } throw new Error('Chrome CDP did not open'); }
async function openTarget() { const u = `http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`; try { return await fetchJson(u, { method: 'PUT' }); } catch { return fetchJson(u); } }
const chrome = spawn(chromePath, [`--remote-debugging-port=${port}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' });
try {
  await waitForChrome();
  const target = await openTarget();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res, { once: true }); ws.addEventListener('error', rej, { once: true }); });
  await send(ws, 'Runtime.enable');
  await wait(9500);
  const expression = `(() => {
    const main = window.AWTSMOOS_LIVING_REGION_MAIN || window.__AWTSMOOS_LIVING_REGION_MAIN__ || null;
    const progress = window.__AWTSMOOS_WORKER_PROGRESS__ || null;
    const last = main?.last?.payload?.stats || main?.received?.at?.(-1)?.payload?.stats || null;
    const director = main?.received?.find?.(x => x.type === 'director')?.payload?.report || null;
    return {
      readyState: document.readyState,
      body: document.body?.innerText.slice(0, 80),
      lastStage: progress?.lastStage || null,
      historyTail: progress?.history?.slice?.(-18) || [],
      directorSummary: director?.summary || null,
      runtimeStats: last,
      diagReady: typeof window.__AWTSMOOS_DIAG_COPY__ === 'function'
    };
  })()`;
  const result = await send(ws, 'Runtime.evaluate', { expression, returnByValue: true });
  console.log(JSON.stringify({ ok: true, proof: result.result?.value || null }, null, 2));
  ws.close();
} catch (error) { console.log(JSON.stringify({ ok: false, error: error.message }, null, 2)); process.exitCode = 1; }
finally { chrome.kill(); }
