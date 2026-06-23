// B"H
/** Actual gameplay profiler runner: survives reloads, clicks through entry, and trusts only proven gameplay samples. */
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

async function evalWithReloadRetry(cdp, params, timeoutMs, tries = 6) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      return await cdp.send('Runtime.evaluate', params, timeoutMs);
    } catch (error) {
      last = error;
      if (!/Execution context was destroyed|Cannot find context|Target closed/i.test(String(error?.message || error))) throw error;
      await pause(900 + i * 450);
    }
  }
  throw last;
}

function valueFromRuntime(runtime, fallback) {
  if (runtime?.exceptionDetails) return { ...fallback, exception: runtime.exceptionDetails.text || 'runtime-eval-exception', exceptionDescription: runtime.exceptionDetails.exception?.description || '', exceptionLine: runtime.exceptionDetails.lineNumber, exceptionColumn: runtime.exceptionDetails.columnNumber };
  return runtime?.result?.value || fallback;
}

function sampleDerivedReadiness(sample = {}, original = {}) {
  const body = String(sample.bodyText || '');
  const noEntryScreen = !/enter world/i.test(body);
  const noLoading = !/loading|generating|preparing|initializing|please wait/i.test(body);
  const hasCanvas = Number(sample.canvases || 0) > 0;
  const activeFrames = Number(sample.frameCount || 0) > 30;
  const ok = Boolean(sample.sampleStartedAfterFullGameplayLoad && hasCanvas && activeFrames && noEntryScreen && noLoading);
  return ok ? {
    ok: true,
    derivedFromSample: true,
    original,
    hasCanvas,
    activeFrames,
    noEntryScreen,
    noLoading,
    reason: 'sample-derived-gameplay-ready'
  } : original;
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
    await pause(options.settleMs + 2500);
    const readyRuntime = await evalWithReloadRetry(cdp, {
      expression: readinessExpression(options.maxReadyWaitMs, options.gameplayQuietMs),
      awaitPromise: true,
      returnByValue: true
    }, options.maxReadyWaitMs + options.gameplayQuietMs + 12000);
    const initialReadiness = valueFromRuntime(readyRuntime, { ok: false, reason: 'readiness-eval-returned-empty' });
    const sampleRuntime = await evalWithReloadRetry(cdp, {
      expression: gameplaySampleExpression(options.durationMs),
      awaitPromise: true,
      returnByValue: true
    }, options.durationMs + 22000);
    const sample = valueFromRuntime(sampleRuntime, {});
    const readiness = sampleDerivedReadiness(sample, initialReadiness);
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
