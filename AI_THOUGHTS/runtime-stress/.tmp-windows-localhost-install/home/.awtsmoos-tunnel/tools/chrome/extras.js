// B"H
const fsp = require("fs/promises");
const path = require("path");
const { ROOT, loadConfig } = require("../../lib/config.js");
const { ensurePage, cdpCall, navigateAndWait } = require("./cdp.js");
const { readChromeLogs } = require("./logs.js");
const { pageSnapshot } = require("./snapshot.js");

/**
 * B"H
 * Ensures Chrome is enabled and page socket exists.
 *
 * @param {object} payload Payload.
 * @returns {Promise<object>} Config and port.
 */
async function ready(payload = {}) {
  const config = loadConfig();
  if (!config.chrome.enabled || !config.tools.chrome) {
    const err = new Error("chrome_disabled");
    err.code = "chrome_disabled";
    throw err;
  }

  const port = Number(payload.port || config.chrome.port || 9222);
  await ensurePage(port);
  return { config, port };
}

/**
 * B"H
 * Captures a screenshot from the current page.
 *
 * @param {object} payload Payload.
 * @returns {Promise<object>} Screenshot result.
 */
async function chromeScreenshot(payload = {}) {
  await ready(payload);

  const result = await cdpCall("Page.captureScreenshot", {
    format: payload.format || "png",
    fromSurface: true,
    captureBeyondViewport: payload.fullPage !== false
  }, payload.timeoutMs || 30000);

  const content64 = result.data || "";
  let savedPath = null;

  if (payload.path) {
    const rel = String(payload.path).replace(/^[/\\]+/, "");
    const full = path.join(ROOT, rel);
    await fsp.mkdir(path.dirname(full), { recursive: true });
    await fsp.writeFile(full, Buffer.from(content64, "base64"));
    savedPath = full;
  }

  return {
    ok: true,
    action: "chromeScreenshot",
    format: payload.format || "png",
    bytes: Buffer.byteLength(content64, "base64"),
    savedPath,
    content64: payload.path ? "" : content64
  };
}

/**
 * B"H
 * Returns network-related log entries already captured by CDP.
 *
 * @param {object} payload Payload.
 * @returns {Promise<object>} Network log result.
 */
async function chromeNetwork(payload = {}) {
  const logs = readChromeLogs({ maxLogs: payload.maxLogs || 500, clear: !!payload.clearLogs }).logs;
  const network = logs.filter(x => x.source.startsWith("network") || x.details?.url || x.details?.requestId);
  const filtered = payload.failedOnly === false ? network : network.filter(x => x.level === "error" || x.source.includes("Failed"));

  return {
    ok: true,
    action: "chromeNetwork",
    failedOnly: payload.failedOnly !== false,
    count: filtered.length,
    logs: filtered
  };
}

/**
 * B"H
 * Returns an accessibility-ish DOM map for browser control without guessing.
 *
 * @param {object} payload Payload.
 * @returns {Promise<object>} Accessibility result.
 */
async function chromeAccessibilitySnapshot(payload = {}) {
  await ready(payload);

  const limit = Math.max(1, Math.min(Number(payload.limit || 200), 1000));
  const expression = `
    (() => {
      const pick = (el) => ({
        tag: el.tagName,
        id: el.id || "",
        className: String(el.className || ""),
        role: el.getAttribute("role") || "",
        ariaLabel: el.getAttribute("aria-label") || "",
        name: el.getAttribute("name") || "",
        type: el.getAttribute("type") || "",
        href: el.getAttribute("href") || "",
        text: (el.innerText || el.value || "").trim().slice(0, 220)
      });
      const selectors = "a,button,input,textarea,select,[role],h1,h2,h3,h4,label";
      return Array.from(document.querySelectorAll(selectors)).slice(0, ${limit}).map(pick);
    })()
  `;

  const result = await cdpCall("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });

  return {
    ok: true,
    action: "chromeAccessibilitySnapshot",
    count: result.result?.value?.length || 0,
    items: result.result?.value || []
  };
}

/**
 * B"H
 * One-shot headless-ready URL test with logs, selector, snapshot, and failure summary.
 *
 * @param {object} payload Payload.
 * @returns {Promise<object>} Test result.
 */
async function chromeTestUrl(payload = {}) {
  const { port } = await ready(payload);
  const url = payload.url || "about:blank";

  if (payload.clearLogs !== false) readChromeLogs({ clear: true });

  const navigation = await navigateAndWait(url, Number(payload.timeoutMs || 30000), port);

  if (payload.selector) {
    const start = Date.now();
    const timeout = Number(payload.selectorTimeoutMs || payload.timeoutMs || 10000);
    while (Date.now() - start < timeout) {
      const seen = await cdpCall("Runtime.evaluate", {
        expression: "!!document.querySelector(" + JSON.stringify(payload.selector) + ")",
        returnByValue: true
      });
      if (seen.result?.value) break;
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  if (payload.waitMs) await new Promise(resolve => setTimeout(resolve, Math.min(Number(payload.waitMs), 30000)));

  const snap = payload.snapshot === false ? null : await pageSnapshot(payload);
  const logRead = readChromeLogs({ maxLogs: payload.maxLogs || 300 });
  const errors = logRead.logs.filter(x => x.level === "error" || x.source.includes("exception") || x.source.includes("loadingFailed"));
  const ok = navigation.ok !== false && (payload.assertNoConsoleErrors ? errors.length === 0 : true);

  return {
    ok,
    action: "chromeTestUrl",
    url,
    navigation,
    selector: payload.selector || "",
    errorCount: errors.length,
    errors,
    snapshot: snap,
    logs: logRead
  };
}

module.exports = {
  chromeScreenshot,
  chromeNetwork,
  chromeAccessibilitySnapshot,
  chromeTestUrl
};
