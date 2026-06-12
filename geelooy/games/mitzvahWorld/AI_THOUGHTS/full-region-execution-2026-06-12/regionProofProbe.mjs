// B"H
/**
 * Fresh isolated Chrome/CDP probe for living-region proof.
 * It avoids the tunnel's oversized Chrome log wrapper and prints one JSON line.
 */
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9333;
const root = process.cwd().replaceAll('\\', '/');
const userDataDir = `${root}/.awtsmoos-tmp/region-proof-chrome-${Date.now()}`;
const url = 'http://127.0.0.1:8080/games/mitzvahWorld/?path=village.json&v=region-proof-cdp-bh1';
let id = 0;

function send(ws, method, params = {}) {
  const messageId = ++id;
  ws.send(JSON.stringify({ id: messageId, method, params }));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 30000);
    const handler = event => {
      const data = JSON.parse(event.data.toString());
      if (data.id !== messageId) return;
      clearTimeout(timer);
      ws.removeEventListener('message', handler);
      if (data.error) reject(new Error(JSON.stringify(data.error)));
      else resolve(data.result);
    };
    ws.addEventListener('message', handler);
  });
}

async function fetchJson(endpoint, options = {}) {
  const response = await fetch(endpoint, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} ${endpoint}`);
  return response.json();
}

async function openTarget() {
  const targetUrl = `http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`;
  try { return await fetchJson(targetUrl, { method: 'PUT' }); }
  catch (_) { return fetchJson(targetUrl); }
}

async function waitForChrome() {
  for (let i = 0; i < 80; i++) {
    try { return await fetchJson(`http://127.0.0.1:${port}/json/version`); }
    catch (_) { await wait(250); }
  }
  throw new Error('Chrome CDP did not open');
}

const chrome = spawn(chromePath, [
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  '--headless=new',
  '--disable-gpu',
  '--disable-extensions',
  '--no-first-run',
  '--no-default-browser-check',
  'about:blank'
], { stdio: 'ignore', detached: false });

try {
  await waitForChrome();
  const target = await openTarget();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  await send(ws, 'Page.enable');
  await send(ws, 'Runtime.enable');
  await wait(9000);
  const expression = `(() => {
    const copy = typeof window.__AWTSMOOS_DIAG_COPY__ === 'function'
      ? JSON.parse(window.__AWTSMOOS_DIAG_COPY__({ probe: 'region-proof-cdp-bh1' }))
      : null;
    return {
      href: location.href,
      title: document.title,
      workerProgress: window.__AWTSMOOS_WORKER_PROGRESS__ || null,
      livingMain: window.AWTSMOOS_LIVING_REGION_MAIN || window.__AWTSMOOS_LIVING_REGION_MAIN__ || null,
      livingStats: window.AWTSMOOS_LIVING_REGION_STATS || null,
      livingReport: window.AWTSMOOS_LIVING_REGION_REPORT || null,
      regionDebug: window.AWTSMOOS_REGION_DEBUG || null,
      diag: copy
    };
  })()`;
  const result = await send(ws, 'Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    timeout: 30000
  });
  console.log(JSON.stringify({ ok: true, value: result.result?.value || null }, null, 2));
  ws.close();
} catch (error) {
  console.log(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exitCode = 1;
} finally {
  chrome.kill();
}
