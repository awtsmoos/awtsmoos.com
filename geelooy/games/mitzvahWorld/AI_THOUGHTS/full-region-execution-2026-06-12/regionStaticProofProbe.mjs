// B"H
/** Compact static-server Chrome/CDP proof probe for Mitzvah World. */
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9336;
const root = process.cwd().replaceAll('\\', '/');
const userDataDir = `${root}/.awtsmoos-tmp/region-static-proof-${Date.now()}`;
const url = 'http://127.0.0.1:8090/games/mitzvahWorld/?path=village.json&v=region-static-proof-bh1';
let id = 0;
const events = [];
const keep = (kind, data) => { events.push({ kind, data }); if (events.length > 70) events.shift(); };
function send(ws, method, params = {}) {
  const messageId = ++id;
  ws.send(JSON.stringify({ id: messageId, method, params }));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 30000);
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
async function waitForChrome() { for (let i = 0; i < 80; i++) { try { return await fetchJson(`http://127.0.0.1:${port}/json/version`); } catch { await wait(250); } } throw new Error('Chrome CDP did not open'); }
async function openTarget() { const u = `http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`; try { return await fetchJson(u, { method: 'PUT' }); } catch { return fetchJson(u); } }
const chrome = spawn(chromePath, [`--remote-debugging-port=${port}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--disable-gpu', '--disable-extensions', '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' });
try {
  await waitForChrome();
  const target = await openTarget();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res, { once: true }); ws.addEventListener('error', rej, { once: true }); });
  ws.addEventListener('message', event => {
    const data = JSON.parse(event.data.toString());
    if (data.method === 'Runtime.consoleAPICalled') keep('console', { type: data.params.type, args: (data.params.args || []).map(a => String(a.value || a.description || '')).join(' ').slice(0, 700) });
    if (data.method === 'Runtime.exceptionThrown') keep('exception', data.params.exceptionDetails?.exception?.description || data.params.exceptionDetails?.text || data.params);
    if (data.method === 'Network.loadingFailed') keep('networkFailed', { type: data.params.type, errorText: data.params.errorText });
  });
  await send(ws, 'Page.enable'); await send(ws, 'Runtime.enable'); await send(ws, 'Network.enable');
  await wait(28000);
  const expression = `(() => ({
    readyState: document.readyState,
    bodyText: document.body ? document.body.innerText.slice(0, 220) : null,
    canvasCount: document.querySelectorAll('canvas').length,
    workerProgress: window.__AWTSMOOS_WORKER_PROGRESS__ || null,
    livingMain: window.AWTSMOOS_LIVING_REGION_MAIN || window.__AWTSMOOS_LIVING_REGION_MAIN__ || null,
    livingStats: window.AWTSMOOS_LIVING_REGION_STATS || null,
    livingReport: window.AWTSMOOS_LIVING_REGION_REPORT || null,
    diagReady: typeof window.__AWTSMOOS_DIAG_COPY__ === 'function',
    diag: typeof window.__AWTSMOOS_DIAG_COPY__ === 'function' ? JSON.parse(window.__AWTSMOOS_DIAG_COPY__({ probe: 'static-proof' })) : null
  }))()`;
  const result = await send(ws, 'Runtime.evaluate', { expression, returnByValue: true });
  console.log(JSON.stringify({ ok: true, page: result.result?.value || null, events }, null, 2));
  ws.close();
} catch (error) { console.log(JSON.stringify({ ok: false, error: error.message, events }, null, 2)); process.exitCode = 1; }
finally { chrome.kill(); }
