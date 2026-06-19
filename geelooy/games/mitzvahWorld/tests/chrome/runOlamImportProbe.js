#!/usr/bin/env node
// B"H
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { findBrowser } from './ChromePath.js';
import { startStaticServer } from './StaticServer.js';
import { launchChrome } from './ChromeLauncher.js';
import { connectCdp } from './ChromeDevTools.js';

const outPath = 'tests/chrome/olamImportProbeReport.json';
const events = [];
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

function textFromArg(arg) { return String(arg.value ?? arg.description ?? arg.type ?? ''); }
function capture(event) {
  if (event.method === 'Runtime.exceptionThrown') events.push({ kind: 'exception', params: event.params });
  if (event.method === 'Runtime.consoleAPICalled') events.push({ kind: `console:${event.params.type}`, text: (event.params.args || []).map(textFromArg).join(' '), params: event.params });
  if (event.method === 'Log.entryAdded') events.push({ kind: `log:${event.params.entry?.level}`, text: event.params.entry?.text, params: event.params });
}

let server; let chrome; let cdp;
try {
  const browser = findBrowser();
  server = await startStaticServer(path.resolve(process.cwd(), '../../..'));
  const base = `http://127.0.0.1:${server.port}`;
  const url = `${base}/geelooy/games/mitzvahWorld/index.html`;
  chrome = await launchChrome(browser.path, url, 9700 + Math.floor(Math.random() * 200));
  cdp = await connectCdp(chrome.page.webSocketDebuggerUrl, capture);
  await cdp.send('Runtime.enable'); await cdp.send('Log.enable');
  await pause(700);
  const expression = `import('/geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/core/OlamVessel.js?v=probe-${Date.now()}')
    .then(mod => ({ ok: true, keys: Object.keys(mod), hasDefault: Boolean(mod.default) }))
    .catch(error => ({ ok: false, message: error.message, name: error.name, stack: error.stack }))`;
  const result = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, 30000);
  const report = { ok: Boolean(result.result?.value?.ok), browser, base, result: result.result?.value, events };
  await writeFile(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
} catch (error) {
  const report = { ok: false, crash: { message: error.message, stack: error.stack }, events };
  await writeFile(outPath, JSON.stringify(report, null, 2));
  console.error(JSON.stringify(report, null, 2));
  process.exitCode = 1;
} finally {
  try { cdp?.close(); } catch {}
  try { await chrome?.close(); } catch {}
  try { await server?.close(); } catch {}
}
