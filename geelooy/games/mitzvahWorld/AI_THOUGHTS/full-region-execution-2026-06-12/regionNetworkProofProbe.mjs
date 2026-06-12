// B"H
/** URL-mapped Chrome/CDP probe for failed module fetch. */
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9337;
const root = process.cwd().replaceAll('\\', '/');
const userDataDir = `${root}/.awtsmoos-tmp/region-network-proof-${Date.now()}`;
const url = 'http://127.0.0.1:8090/games/mitzvahWorld/?path=village.json&v=region-network-proof-bh1';
let id = 0;
const events = [];
const urls = new Map();
function keep(kind, data) { events.push({ kind, data }); if (events.length > 100) events.shift(); }
function send(ws, method, params = {}) {
  const messageId = ++id;
  ws.send(JSON.stringify({ id: messageId, method, params }));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 25000);
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
    const p = data.params || {};
    if (data.method === 'Network.requestWillBeSent') urls.set(p.requestId, p.request?.url || '');
    if (data.method === 'Network.responseReceived') keep('response', { type: p.type, status: p.response?.status, url: (p.response?.url || '').slice(0, 300) });
    if (data.method === 'Network.loadingFailed') keep('failed', { type: p.type, errorText: p.errorText, canceled: p.canceled, url: (urls.get(p.requestId) || '').slice(0, 500) });
    if (data.method === 'Runtime.consoleAPICalled') keep('console', { type: p.type, args: (p.args || []).map(a => String(a.value || a.description || '')).join(' ').slice(0, 900) });
    if (data.method === 'Runtime.exceptionThrown') keep('exception', p.exceptionDetails?.exception?.description || p.exceptionDetails?.text || p);
  });
  await send(ws, 'Page.enable'); await send(ws, 'Runtime.enable'); await send(ws, 'Network.enable');
  await wait(10000);
  const result = await send(ws, 'Runtime.evaluate', { expression: `(() => ({ body: document.body?.innerText.slice(0, 500), progress: window.__AWTSMOOS_WORKER_PROGRESS__ || null, lastError: window.__AWTSMOOS_LAST_ERROR__ || null }))()`, returnByValue: true });
  console.log(JSON.stringify({ ok: true, page: result.result?.value || null, events }, null, 2));
  ws.close();
} catch (error) { console.log(JSON.stringify({ ok: false, error: error.message, events }, null, 2)); process.exitCode = 1; }
finally { chrome.kill(); }
