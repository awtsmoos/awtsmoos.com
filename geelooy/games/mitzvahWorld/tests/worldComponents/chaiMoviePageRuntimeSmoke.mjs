// B"H
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findBrowser } from '../chrome/ChromePath.js';
import { connectCdp } from '../chrome/ChromeDevTools.js';
const root = '/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com';
const port = 8094, chromePort = 9874;
const pagePath = '/geelooy/games/mitzvahWorld/tools/awtsmoosFullOneMinuteMitzvahWorldMovie.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function json(u, opts) { const r = await fetch(u, opts); if (!r.ok) throw new Error(`${r.status} ${u}`); return r.json(); }
async function ev(c, e, t = 20000) { const r = await c.send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }, t); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'eval failed'); return r.result?.value; }
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
const browser = findBrowser().path; assert(browser, 'Chrome missing');
const chrome = spawn(browser, [`--remote-debugging-port=${chromePort}`, `--user-data-dir=${join(tmpdir(), 'chai-page-' + Date.now())}`, '--no-first-run', '--no-default-browser-check', '--window-size=1280,720', 'about:blank'], { stdio: 'ignore', detached: true });
try {
  for (let i = 0; i < 60; i++) { try { const r = await fetch(`http://127.0.0.1:${port}${pagePath}`); if (r.ok) break; } catch {} await sleep(200); }
  for (let i = 0; i < 80; i++) { try { await json(`http://127.0.0.1:${chromePort}/json/version`); break; } catch { await sleep(200); } }
  const pageUrl = `http://127.0.0.1:${port}${pagePath}?smoke=${Date.now()}`;
  const target = await json(`http://127.0.0.1:${chromePort}/json/new?${encodeURIComponent(pageUrl)}`, { method: 'PUT' });
  const client = await connectCdp(target.webSocketDebuggerUrl); await client.send('Runtime.enable'); await client.send('Page.enable');
  let report = null, lastError = null;
  for (let i = 0; i < 90; i++) {
    report = await ev(client, 'window.__MASAI_ONE_MINUTE_REPORT__||null').catch(() => null);
    if (report?.staticAssetBase?.includes('chai-forest')) break;
    lastError = await ev(client, 'window.__MASAI_MOVIE_ERROR__||window.__MASAI_CHAI_FIELD_ERROR__||null').catch(() => null);
    if (lastError) throw new Error(lastError);
    await sleep(500);
  }
  if (!report?.staticAssetBase?.includes('chai-forest')) {
    const diagnostics = await ev(client, '({href:location.href,title:document.title,body:document.body?.innerText?.slice(0,300),err:window.__MASAI_MOVIE_ERROR__||window.__MASAI_CHAI_FIELD_ERROR__||null,report:window.__MASAI_ONE_MINUTE_REPORT__||null})').catch(e => ({ evalError: String(e) }));
    throw new Error(`report did not expose Chai asset base ${JSON.stringify(diagnostics)}`);
  }
  assert.equal(report.usesFakeCartoonTrees, false); assert(report.groundAware); assert(report.furGang?.horseFur);
  console.log(JSON.stringify({ ok: true, test: 'chaiMoviePageRuntimeSmoke', trees: report.trees, varieties: report.realTreeVarietyCount, base: report.staticAssetBase }, null, 2));
  client.close?.();
} finally { try { process.kill(-chrome.pid); } catch { try { chrome.kill(); } catch {} } try { server.kill(); } catch {} }
