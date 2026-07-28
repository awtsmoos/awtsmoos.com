// B"H
const fsp = require("fs/promises");
const path = require("path");
const { ROOT, loadConfig } = require("../../lib/config.js");
const { ensurePage, cdpCall, navigateAndWait } = require("./cdp.js");
const chromeActions = require("./actions.js");
const { readChromeLogs } = require("./logs.js");
const { pageSnapshot } = require("./snapshot.js");
const { compactLogs, compactRemoteResult, valueSummary } = require("./compact.js");
async function ready(payload = {}) {
  const config = loadConfig();
  if (!config.chrome.enabled || !config.tools.chrome) {
    const err = new Error("chrome_disabled");
    err.code = "chrome_disabled";
    throw err;
  }
  const port = Number(payload.port || config.chrome.port || 9222);
  try {
    await ensurePage(port, { timeoutMs:Math.min(timeoutOf(payload, 10000), 10000) });
    return { config, port, launched:false };
  } catch (originalError) {
    if (payload.autoLaunch === false) throw originalError;
    const launched = await chromeActions.chromeLaunch({
      ...payload,
      port,
      url:payload.url || "about:blank",
      headless:payload.headless !== false,
      persist:payload.persistChrome === true,
      startupWaitMs:payload.startupWaitMs || 1200,
      timeoutMs:Math.min(timeoutOf(payload, 15000), 15000)
    });
    if (launched?.ok === false) {
      const error = new Error(launched.error || "chrome_auto_launch_failed");
      error.details = launched;
      throw error;
    }
    await ensurePage(port, { forceReconnect:true, timeoutMs:Math.min(timeoutOf(payload, 15000), 15000) });
    return { config:loadConfig(), port, launched:true, launch:launched, originalError:originalError.message };
  }
}
function timeoutOf(payload = {}, fallback = 30000) { const n = Number(payload.timeoutMs || fallback); const max = Number(process.env.AWTSMOOS_CHROME_MAX_TIMEOUT_MS || 24 * 60 * 60 * 1000); return Number.isFinite(n) ? Math.max(1000, Math.min(n, max)) : fallback; }
function logs(payload = {}) { return compactLogs(readChromeLogs({ maxLogs:payload.maxLogs || 80, clear:!!payload.clearLogs }), payload.maxLogs || 80); }
async function chromeScreenshot(payload = {}) {
  await ready(payload);
  const result = await cdpCall("Page.captureScreenshot", { format:payload.format || "png", fromSurface:true, captureBeyondViewport:payload.fullPage !== false }, timeoutOf(payload));
  const content64 = result.data || ""; let savedPath = null;
  if (payload.path || payload.inline !== true) { const rel = String(payload.path || `.awtsmoos/chrome/screenshots/${Date.now().toString(36)}.${payload.format || "png"}`).replace(/^[/\\]+/, ""); const full = path.join(ROOT, rel); await fsp.mkdir(path.dirname(full), { recursive:true }); await fsp.writeFile(full, Buffer.from(content64, "base64")); savedPath = full; }
  return { ok:true, action:"chromeScreenshot", format:payload.format || "png", bytes:Buffer.byteLength(content64, "base64"), savedPath, content64:payload.inline === true ? content64 : "" };
}
async function chromeNetwork(payload = {}) { const logRead = readChromeLogs({ maxLogs:payload.maxLogs || 300, clear:!!payload.clearLogs }); const network = logRead.logs.filter(x => x.source.startsWith("network") || x.details?.url || x.details?.requestId); const filtered = payload.failedOnly === false ? network : network.filter(isChromeError); return { ok:true, action:"chromeNetwork", failedOnly:payload.failedOnly !== false, count:filtered.length, logs:compactLogs({ ...logRead, logs:filtered }, payload.maxLogs || 80) }; }
async function chromeAccessibilitySnapshot(payload = {}) {
  await ready(payload); const limit = Math.max(1, Math.min(Number(payload.limit || 100), 300));
  const expression = `(() => { const pick = el => ({ tag:el.tagName, id:el.id||"", className:String(el.className||"").slice(0,120), role:el.getAttribute("role")||"", ariaLabel:(el.getAttribute("aria-label")||"").slice(0,220), name:el.getAttribute("name")||"", type:el.getAttribute("type")||"", href:(el.getAttribute("href")||"").slice(0,300), text:(el.innerText||el.value||"").trim().slice(0,220) }); return Array.from(document.querySelectorAll("a,button,input,textarea,select,[role],h1,h2,h3,h4,label")).slice(0, ${limit}).map(pick); })()`;
  const result = await cdpCall("Runtime.evaluate", { expression, awaitPromise:true, returnByValue:true }, timeoutOf(payload)); const items = result.result?.value || [];
  return { ok:true, action:"chromeAccessibilitySnapshot", count:items.length, items };
}
async function chromeTestUrl(payload = {}) {
  const readiness = await ready(payload); const { port } = readiness; const url = payload.url || "about:blank"; if (payload.clearLogs !== false) readChromeLogs({ clear:true }); const startedAt = Date.now();
  const navigation = await navigateAndWait(url, timeoutOf(payload), port);
  let selectorFound = !payload.selector;
  if (payload.selector) { const start = Date.now(), timeout = timeoutOf({ timeoutMs:payload.selectorTimeoutMs || payload.timeoutMs }, 10000); while (Date.now() - start < timeout) { const seen = await cdpCall("Runtime.evaluate", { expression:"!!document.querySelector(" + JSON.stringify(payload.selector) + ")", returnByValue:true }, Math.min(timeout, 15000)); if (seen.result?.value) { selectorFound = true; break; } await new Promise(resolve => setTimeout(resolve, 250)); } }
  if (payload.waitMs) await new Promise(resolve => setTimeout(resolve, Math.min(Number(payload.waitMs), 30000)));
  const snap = payload.snapshot === false ? null : await pageSnapshot({ ...payload, maxText:Math.min(Number(payload.maxText || 2500), 8000) }); const logRead = readChromeLogs({ maxLogs:payload.maxLogs || 120 }); const freshLogs = logRead.logs.filter(entry => eventTimestamp(entry) >= startedAt); const errors = freshLogs.filter(isChromeError); const ok = navigation.ok !== false && selectorFound && (payload.assertNoConsoleErrors ? errors.length === 0 : true);
  return { ok, action:"chromeTestUrl", url, port, autoLaunched:readiness.launched === true, launchPid:readiness.launch?.pid || null, navigation, selector:payload.selector || "", selectorFound, errorCount:errors.length, errors:compactLogs({ ...logRead, logs:errors }, 40), snapshot:snap ? valueSummary(snap, Number(payload.maxSnapshotChars || 12000)) : null, logs:compactLogs({ ...logRead, logs:freshLogs }, payload.maxLogs || 80) };
}

function eventTimestamp(entry = {}) {
  const embedded = Number(entry.details?.timestamp);
  if (Number.isFinite(embedded) && embedded > 0) {
    if (embedded > 1e12) return embedded;
    if (embedded > 1e9) return embedded * 1000;
  }
  return Number(entry.ts || 0);
}

function isChromeError(entry = {}) {
  return String(entry.level || "").toLowerCase() === "error"
    || /exception/i.test(String(entry.source || ""));
}

async function chromeDoctor(payload = {}) {
  const report = { ok: true, action: payload.action || "chromeDoctor", url: payload.url || "", checks: {} };
  if (payload.url) report.checks.navigation = await chromeTestUrl({ ...payload, snapshot: payload.snapshot !== false });
  report.checks.network = await chromeNetwork({ ...payload, failedOnly: payload.failedOnly !== false });
  report.checks.accessibility = payload.accessibility === false ? null : await safe(() => chromeAccessibilitySnapshot(payload));
  report.checks.screenshot = payload.screenshot === false ? null : await safe(() => chromeScreenshot({ ...payload, inline: false }));
  const logRead = readChromeLogs({ maxLogs: payload.maxLogs || 200 });
  const errors = logRead.logs.filter(isChromeError);
  report.logs = compactLogs(logRead, payload.maxLogs || 100);
  report.errors = compactLogs({ ...logRead, logs: errors }, 50);
  report.errorCount = errors.length;
  report.ok = Object.values(report.checks).every(x => !x || x.ok !== false) && (!payload.assertNoConsoleErrors || errors.length === 0);
  return report;
}
async function safe(fn) { try { return await fn(); } catch (e) { return { ok: false, error: e.message }; } }

module.exports = { chromeScreenshot, chromeNetwork, chromeAccessibilitySnapshot, chromeTestUrl, chromeDoctor, ready, eventTimestamp, isChromeError };
