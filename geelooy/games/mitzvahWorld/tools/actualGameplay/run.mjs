// B"H
/** Actual gameplay profiler runner: waits for gameplay-ready before FPS sample. */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { findBrowser } from '../../tests/chrome/ChromePath.js';
import { launchChrome } from '../../tests/chrome/ChromeLauncher.js';
import { connectCdp } from '../../tests/chrome/ChromeDevTools.js';
import { RESULT_FILE, profilerOptions, textFromArg } from './args.mjs';
import { gameplaySampleExpression, readinessExpression } from './browserSample.mjs';
import { classify } from './classify.mjs';

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

function onChromeEvent(events) {
  return event => {
    if (event.method === 'Runtime.consoleAPICalled') {
      events.push({ type: event.params.type, text: (event.params.args || []).map(textFromArg).join(' ').slice(0, 600) });
    }
    if (event.method === 'Runtime.exceptionThrown') {
      events.push({ type: 'exception', text: String(event.params.exceptionDetails?.text || 'Runtime exception').slice(0, 600) });
    }
  };
}

async function writeReadJson(file, payload) {
  await writeFile(file, JSON.stringify(payload, null, 2));
  return JSON.parse(await readFile(file, 'utf8'));
}

export async function runActualGameplayProfiler() {
  const options = profilerOptions();
  const resultPath = path.join(options.outDir, RESULT_FILE);
  const startedAt = new Date().toISOString();
  const consoleEvents = [];
  let chrome;
  let cdp;
  await mkdir(options.outDir, { recursive: true });
  try {
    await writeReadJson(resultPath, { ok: false, status: 'started', name: 'ActualGameplayProfiler', startedAt, url: options.url });
    const browser = findBrowser();
    if (!browser.path) throw new Error(`ActualGameplayProfiler could not find Chrome. Candidates: ${browser.candidates?.join(', ') || 'none'}`);
    chrome = await launchChrome(browser.path, options.url, options.debugPort, { headless: !options.headed, width: 1366, height: 768 });
    cdp = await connectCdp(chrome.page.webSocketDebuggerUrl, onChromeEvent(consoleEvents));
    await cdp.send('Runtime.enable');
    await cdp.send('Log.enable');
    await cdp.send('Page.enable');
    await pause(options.settleMs);
    const readyRuntime = await cdp.send('Runtime.evaluate', {
      expression: readinessExpression(options.maxReadyWaitMs, options.gameplayQuietMs),
      awaitPromise: true,
      returnByValue: true
    }, options.maxReadyWaitMs + options.gameplayQuietMs + 8000);
    const readiness = readyRuntime.result?.value || { ok: false, reason: 'readiness-eval-returned-empty' };
    const sampleRuntime = await cdp.send('Runtime.evaluate', {
      expression: gameplaySampleExpression(options.durationMs),
      awaitPromise: true,
      returnByValue: true
    }, options.durationMs + 20000);
    const sample = sampleRuntime.result?.value || {};
    return await writeReadJson(resultPath, {
      ok: Boolean(readiness.ok),
      name: 'ActualGameplayProfiler',
      startedAt,
      finishedAt: new Date().toISOString(),
      requestedUrl: options.url,
      resultPath,
      browser: { path: browser.path, port: options.debugPort, headed: options.headed },
      readiness,
      sample,
      consoleEvents: consoleEvents.slice(-40),
      improvements: classify(sample, readiness)
    });
  } catch (error) {
    return await writeReadJson(resultPath, {
      ok: false,
      name: 'ActualGameplayProfiler',
      startedAt,
      finishedAt: new Date().toISOString(),
      url: options.url,
      resultPath,
      error: error.message,
      stack: error.stack,
      consoleEvents
    });
  } finally {
    try { cdp?.close?.(); } catch {}
    try { await chrome?.close?.(); } catch {}
  }
}
