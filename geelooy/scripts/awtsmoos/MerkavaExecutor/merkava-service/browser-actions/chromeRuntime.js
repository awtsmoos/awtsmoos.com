// B"H
/**
 * @file chromeRuntime.js
 * @description Chapter 76: the Chrome-backed witness stops leaving before the
 * story begins. Importing the starter is not enough; the Awtsmoos waits for a
 * visible body, canvas, autoload completion, worker progress, or a real error.
 */
import { connectCdp, enableBrowserDomains, findPageTarget, listTargets, navigatePage } from "./cdpClient.js";
import { runPageActions } from "./pageActions.js";
import { collectPageSnapshot, summarizeCdpEvents } from "./pageSnapshot.js";

const DEFAULT_SETTLE_MS = 6000;
const DEFAULT_TIMEOUT_MS = 25000;

function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function targetUrl(options = {}) { return String(options.url || options.origin || "http://localhost:8080/"); }
function normalizeArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try { const parsed = JSON.parse(String(value)); return Array.isArray(parsed) ? parsed : []; }
  catch (_) { return []; }
}
function requestedValues(options = {}) { return normalizeArray(options.returnValues || options.values || options.probes).filter(item => typeof item === "string"); }
function targetFragmentFromUrl(url) { try { return new URL(url).pathname; } catch (_) { return String(url).slice(0, 60); } }
async function pickTarget(options = {}) {
  const url = targetUrl(options);
  const fragment = options.targetUrlFragment || targetFragmentFromUrl(url);
  return findPageTarget(fragment).catch(() => findPageTarget(""));
}
async function installPreloadGuards(cdp, options = {}) {
  const script = `(() => {
    globalThis.__AWTSMOOS_SIMULATE_RUNTIME__ = { engine: 'chrome-cdp', installedAt: new Date().toISOString(), url: location.href };
    globalThis.__AWTSMOOS_CAPTURED_ERRORS__ = [];
    addEventListener('error', event => globalThis.__AWTSMOOS_CAPTURED_ERRORS__.push({ type:'error', message:String(event.message||''), filename:event.filename, line:event.lineno, column:event.colno, stack:String(event.error?.stack||'') }));
    addEventListener('unhandledrejection', event => globalThis.__AWTSMOOS_CAPTURED_ERRORS__.push({ type:'unhandledrejection', reason:String(event.reason?.message||event.reason||''), stack:String(event.reason?.stack||'') }));
  })();`;
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: script }).catch(() => null);
  if (options.injectScript) await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: String(options.injectScript) }).catch(() => null);
}
function phaseNames(snapshot) { return (snapshot?.awtsmoos?.ikarPhases || []).map(row => row.phase); }
function isMeaningful(snapshot) {
  const phases = phaseNames(snapshot);
  const body = String(snapshot?.bodyText || "");
  const canvases = snapshot?.canvases || [];
  if (snapshot?.awtsmoos?.lastError || snapshot?.snapshotError) return true;
  if (body.length > 0 || canvases.length > 0) return true;
  if (phases.includes("autoload:dispatch:done")) return true;
  if (snapshot?.awtsmoos?.workerProgress) return true;
  return false;
}
async function settleUntilMeaningful(cdp, requested, maxMs) {
  const started = Date.now();
  let last = null;
  while (Date.now() - started < maxMs) {
    last = await collectPageSnapshot(cdp, requested).catch(error => ({ snapshotError: error.message }));
    if (Number(last?.htmlLength || 0) > 80 && isMeaningful(last)) return last;
    await wait(180);
  }
  return last || await collectPageSnapshot(cdp, requested);
}

/** @param {object} options Runtime options. @returns {Promise<object>} */
export async function runChromeRuntime(options = {}) {
  const startedAt = new Date().toISOString();
  const url = targetUrl(options);
  const settleMs = Number(options.settleMs ?? DEFAULT_SETTLE_MS);
  const timeoutMs = Number(options.timeoutMs || DEFAULT_TIMEOUT_MS);
  const target = await pickTarget(options);
  const cdp = await connectCdp(target.webSocketDebuggerUrl);
  try {
    await enableBrowserDomains(cdp);
    await installPreloadGuards(cdp, options);
    if (options.forceNavigate !== false) await navigatePage(cdp, url, timeoutMs);
    const actionLog = await runPageActions(cdp, normalizeArray(options.interactions || options.browserActions || options.pageActions));
    if (actionLog.length) await wait(Number(options.afterActionSettleMs ?? 400));
    const requested = requestedValues(options);
    const snapshot = await settleUntilMeaningful(cdp, requested, settleMs);
    const eventSummary = summarizeCdpEvents(cdp.events);
    const targets = await listTargets().catch(() => []);
    const ok = !snapshot?.awtsmoos?.lastError && !snapshot?.snapshotError && eventSummary.exceptions.length === 0 && eventSummary.network.failureCount === 0;
    return {
      ok,
      action: "simulateRuntime",
      engine: "chrome-cdp",
      browserRuntime: true,
      url,
      startedAt,
      endedAt: new Date().toISOString(),
      target: { id: target.id, type: target.type, title: target.title, url: target.url },
      snapshot,
      values: snapshot?.values || {},
      awtsmoosResult: snapshot?.awtsmoos?.result,
      console: eventSummary.console,
      exceptions: eventSummary.exceptions,
      network: eventSummary.network,
      workers: targets.filter(t => /worker/i.test(t.type || "")).map(t => ({ id: t.id, type: t.type, title: t.title, url: t.url })),
      interactions: normalizeArray(options.interactions || options.browserActions || options.pageActions),
      interactionLog: actionLog,
      browserActionLog: actionLog,
      epochs: [
        { id: 0, name: "chrome-connect", ok: true },
        { id: 1, name: "page-navigate", ok: true, url },
        { id: 2, name: "settle", ok: isMeaningful(snapshot), ms: settleMs },
        { id: 3, name: "browser-actions", ok: true, count: actionLog.length },
        { id: 4, name: "snapshot", ok: !snapshot?.snapshotError }
      ]
    };
  } finally { cdp.close(); }
}
