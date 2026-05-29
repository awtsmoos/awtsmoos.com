// B"H
/**
 * @file realBrowserRuntime.js
 * @description Browser-grade simulateRuntime. This path attaches to a real
 * Chrome DevTools page, navigates, waits, runs Playwright-like actions, captures
 * console/network/runtime state, and returns proof. The Awtsmoos does not merely
 * imagine the DOM; it listens to the living browser.
 */
import { connectCdp, enableBrowserDomains, evaluatePage, findPageTarget, navigatePage } from "../browser-actions/cdpClient.js";
import { runPageActions } from "../browser-actions/pageActions.js";
import { collectPageSnapshot, summarizeCdpEvents } from "../browser-actions/pageSnapshot.js";

/** @param {object} options Runtime options. @returns {boolean} */
export function wantsRealBrowser(options = {}) {
  const engine = String(options.engine || options.provider || options.mode || "").toLowerCase();
  if (["real-browser", "chrome", "chromium", "puppeteer", "playwright", "browser-real"].includes(engine)) return true;
  if (["merkava", "md2", "bytecode"].includes(engine)) return false;
  return Boolean(options.url) && String(options.runtime || "browser") === "browser";
}

/** @param {object} options Runtime options. @returns {Promise<object>} */
export async function simulateRealBrowserRuntime(options = {}) {
  const startedAt = new Date().toISOString();
  const targetHint = new URL(options.url || options.origin || "http://localhost:8080/").pathname;
  const target = await findPageTarget(targetHint).catch(() => findPageTarget(""));
  const cdp = await connectCdp(target.webSocketDebuggerUrl);
  try {
    await enableBrowserDomains(cdp);
    const url = options.url || target.url;
    if (url) await navigatePage(cdp, url, Number(options.navigationTimeoutMs || options.timeoutMs || 20000));
    await waitAfterNavigation(cdp, options);
    const actionLog = await runPageActions(cdp, options.interactions || options.actions || options.browserActions || []);
    await waitAfterActions(cdp, options);
    const snapshot = await collectPageSnapshot(cdp, normalizeReturnValues(options));
    const events = summarizeCdpEvents(cdp.events);
    return shapeBrowserResult({ options, startedAt, snapshot, events, actionLog, target });
  } catch (error) {
    return shapeBrowserError({ options, startedAt, error, events: summarizeCdpEvents(cdp.events), target });
  } finally {
    cdp.close();
  }
}

/** @param {object} cdp CDP client. @param {object} options Options. */
async function waitAfterNavigation(cdp, options) {
  const waitMs = Number(options.waitMs || options.settleMs || 1200);
  await new Promise(resolve => setTimeout(resolve, waitMs));
  if (options.waitForSelector) {
    const selector = JSON.stringify(options.waitForSelector);
    const timeout = Number(options.waitForSelectorTimeoutMs || 7000);
    const started = Date.now();
    while (Date.now() - started < timeout) {
      if (await evaluatePage(cdp, `Boolean(document.querySelector(${selector}))`).catch(() => false)) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`waitForSelector timed out: ${options.waitForSelector}`);
  }
}

/** @param {object} cdp CDP client. @param {object} options Options. */
async function waitAfterActions(cdp, options) {
  const waitMs = Number(options.afterActionsWaitMs || 300);
  if (waitMs > 0) await new Promise(resolve => setTimeout(resolve, waitMs));
}

/** @param {object} options Options. @returns {Array} */
function normalizeReturnValues(options = {}) {
  const raw = options.returnValues || options.values || [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(String(raw)); } catch (_) { return String(raw || "").split(",").map(x => x.trim()).filter(Boolean); }
}

/** @param {object} input Runtime pieces. @returns {object} */
function shapeBrowserResult({ options, startedAt, snapshot, events, actionLog, target }) {
  const checks = browserChecks(snapshot, events);
  const ok = checks.networkFailureCount === 0 && checks.exceptionCount === 0 && !checks.awtsmoosLastError;
  return {
    ok,
    action: "simulateRuntime",
    engine: "real-browser-cdp",
    provider: "chrome-devtools-protocol",
    startedAt,
    endedAt: new Date().toISOString(),
    url: snapshot.url,
    target: { id: target.id, title: target.title, originalUrl: target.url },
    snapshot,
    values: snapshot.values || {},
    awtsmoosResult: snapshot.awtsmoos?.result,
    browserActionLog: actionLog,
    interactionLog: actionLog,
    console: events.console,
    network: events.network,
    exceptions: events.exceptions,
    renderProof: events.renderProof,
    workerProof: events.workerProof,
    checks,
    requested: summarizeOptions(options)
  };
}

/** @param {object} input Error pieces. @returns {object} */
function shapeBrowserError({ options, startedAt, error, events, target }) {
  return {
    ok: false,
    action: "simulateRuntime",
    engine: "real-browser-cdp",
    provider: "chrome-devtools-protocol",
    startedAt,
    endedAt: new Date().toISOString(),
    target: target ? { id: target.id, title: target.title, originalUrl: target.url } : null,
    error: error.message,
    stack: error.stack || "",
    console: events.console,
    network: events.network,
    exceptions: events.exceptions,
    renderProof: events.renderProof,
    workerProof: events.workerProof,
    requested: summarizeOptions(options)
  };
}

/** @param {object} snapshot Snapshot. @param {object} events Events. @returns {object} */
function browserChecks(snapshot, events) {
  return {
    domComplete: snapshot.readyState === "complete",
    hasBodyText: Boolean(snapshot.bodyText),
    canvasCount: snapshot.canvases?.length || 0,
    scriptCount: snapshot.scripts?.length || 0,
    networkFailureCount: events.network.failureCount,
    exceptionCount: events.exceptions.length,
    awtsmoosBootLoaded: Boolean(snapshot.awtsmoos?.bootLoaded),
    awtsmoosLastError: Boolean(snapshot.awtsmoos?.lastError || snapshot.awtsmoos?.lastErrorJson),
    renderConfirmed: Boolean(events.renderProof),
    workerConfirmed: Boolean(events.workerProof || snapshot.awtsmoos?.workerProgress)
  };
}

/** @param {object} options Options. @returns {object} */
function summarizeOptions(options = {}) {
  return { runtime: options.runtime, engine: options.engine, url: options.url, entry: options.entry, waitForSelector: options.waitForSelector };
}
