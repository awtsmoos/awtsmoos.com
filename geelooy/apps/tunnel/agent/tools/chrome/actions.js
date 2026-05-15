// B"H

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const { ROOT, loadConfig, saveConfigPatch } = require("../../lib/config.js");
const { findChrome, chromeFindDetails } = require("./finder.js");
const { version, pages, ensurePage, cdpCall, navigateAndWait } = require("./cdp.js");
const { boolish, chromeLaunchArgs } = require("./launchArgs.js");
const { addChromeLog, readChromeLogs } = require("./logs.js");
const { pageSnapshot } = require("./snapshot.js");

/**
 * B"H
 * Waits while the hidden clock is remade by the Awtsmoos.
 *
 * @param {number} ms Milliseconds.
 * @returns {Promise<void>} Done.
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * B"H
 * Requires Chrome permission before browser fire is touched.
 *
 * @param {object} config Agent config.
 * @param {string} action Action name.
 * @returns {object|null} Blocked response or null.
 */
function requireChromeEnabled(config, action) {
  if (!config.chrome.enabled || !config.tools.chrome) {
    return {
      ok: false,
      action,
      error: "chrome_disabled",
      message: "Enable Chrome tool in dashboard and Save Config."
    };
  }

  return null;
}

/**
 * B"H
 * Finds Chrome/Edge/Brave/Chromium and returns diagnostics.
 *
 * @returns {Promise<object>} Finder response.
 */
async function chromeFind() {
  return { ok: true, action: "chromeFind", ...chromeFindDetails() };
}

/**
 * B"H
 * Launches Chrome, optionally headless, with stdout/stderr captured into logs.
 *
 * @param {object} payload Payload.
 * @returns {Promise<object>} Launch result.
 */
async function chromeLaunch(payload = {}) {
  const config = loadConfig();
  const blocked = requireChromeEnabled(config, "chromeLaunch");
  if (blocked) return blocked;

  const port = Number(payload.port || config.chrome.port || 9222);
  const chromePath = payload.chromePath || config.chrome.path || findChrome();

  if (!chromePath) {
    return {
      ok: false,
      action: "chromeLaunch",
      error: "chrome_not_found",
      ...chromeFindDetails(),
      message: "Could not auto-detect a browser. Paste Chrome, Edge, Brave, or Chromium executable path, then Save Config."
    };
  }

  const userDataDir = payload.userDataDir || config.chrome.userDataDir || path.join(ROOT, "chrome-profile");
  const headless = boolish(payload.headless, boolish(config.chrome.headless, false));
  const args = chromeLaunchArgs({ port, userDataDir, headless, url: payload.url });

  fs.mkdirSync(userDataDir, { recursive: true });

  const proc = childProcess.spawn(chromePath, args, {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"]
  });

  proc.stdout?.on("data", chunk => addChromeLog("process.stdout", "info", chunk.toString("utf8").trim()));
  proc.stderr?.on("data", chunk => addChromeLog("process.stderr", "error", chunk.toString("utf8").trim()));
  proc.on("error", err => addChromeLog("process", "error", err.message, { stack: err.stack }));
  proc.unref();

  saveConfigPatch({
    chrome: { enabled: true, path: chromePath, chromePath, port, userDataDir, headless },
    tools: { chrome: true }
  });

  await wait(Number(payload.startupWaitMs || 1600));
  await ensurePage(port);

  return {
    ok: true,
    action: "chromeLaunch",
    chromePath,
    port,
    userDataDir,
    headless,
    args,
    logs: readChromeLogs({ maxLogs: payload.maxLogs || 100, clear: !!payload.clearLogs })
  };
}

/**
 * B"H
 * Checks Chrome status and includes recent browser logs.
 *
 * @param {object} payload Payload.
 * @returns {Promise<object>} Status result.
 */
async function chromeStatus(payload = {}) {
  const config = loadConfig();
  const port = Number(payload.port || config.chrome.port || 9222);

  try {
    const info = await version(port);
    const list = await pages(port);

    return {
      ok: true,
      action: "chromeStatus",
      connected: true,
      port,
      chromePath: config.chrome.path || findChrome(),
      headless: !!config.chrome.headless,
      info,
      pages: list.map(p => ({ id: p.id, title: p.title, url: p.url, type: p.type })),
      logs: readChromeLogs({ maxLogs: payload.maxLogs || 100, clear: !!payload.clearLogs })
    };
  } catch (e) {
    return {
      ok: true,
      action: "chromeStatus",
      connected: false,
      port,
      chromePath: config.chrome.path || findChrome(),
      ...chromeFindDetails(),
      error: e.message,
      logs: readChromeLogs({ maxLogs: payload.maxLogs || 100, clear: !!payload.clearLogs })
    };
  }
}

/**
 * B"H
 * Navigates the active Chrome page and returns logs born during loading.
 *
 * @param {object} payload Payload.
 * @returns {Promise<object>} Result.
 */
async function chromeNavigate(payload = {}) {
  const config = loadConfig();
  const blocked = requireChromeEnabled(config, "chromeNavigate");
  if (blocked) return blocked;

  const port = Number(payload.port || config.chrome.port || 9222);
  await ensurePage(port);

  if (payload.clearLogs !== false) readChromeLogs({ clear: true });
  const url = payload.url || "about:blank";
  const nav = await navigateAndWait(url, Number(payload.timeoutMs || 30000), port);

  if (payload.waitMs) await wait(Math.min(Number(payload.waitMs), 30000));

  return {
    ok: true,
    action: "chromeNavigate",
    url,
    navigation: nav,
    snapshot: payload.snapshot === false ? null : await pageSnapshot(payload),
    logs: readChromeLogs({ maxLogs: payload.maxLogs || 200, clear: false })
  };
}

/**
 * B"H
 * Evaluates JS.
 *
 * @param {object} payload Payload.
 * @returns {Promise<object>} Result.
 */
async function chromeEval(payload = {}) {
  const config = loadConfig();
  const blocked = requireChromeEnabled(config, "chromeEval");
  if (blocked) return blocked;

  const port = Number(payload.port || config.chrome.port || 9222);
  await ensurePage(port);

  const expression = payload.expression || "document.title";
  const result = await cdpCall("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, payload.timeoutMs || 30000);

  return { ok: true, action: "chromeEval", expression, result, logs: readChromeLogs({ maxLogs: payload.maxLogs || 100 }) };
}

/**
 * B"H
 * Waits for a selector.
 *
 * @param {object} payload Payload.
 * @returns {Promise<object>} Result.
 */
async function chromeWaitForSelector(payload = {}) {
  const config = loadConfig();
  const blocked = requireChromeEnabled(config, "chromeWaitForSelector");
  if (blocked) return blocked;

  const port = Number(payload.port || config.chrome.port || 9222);
  await ensurePage(port);

  const selector = payload.selector;
  const timeout = Number(payload.timeoutMs || 10000);
  if (!selector) return { ok: false, action: "chromeWaitForSelector", error: "missing_selector" };

  const start = Date.now();

  while (Date.now() - start < timeout) {
    const result = await cdpCall("Runtime.evaluate", {
      expression: "!!document.querySelector(" + JSON.stringify(selector) + ")",
      returnByValue: true
    });

    if (result.result?.value) {
      return { ok: true, action: "chromeWaitForSelector", selector, found: true, durationMs: Date.now() - start };
    }

    await wait(250);
  }

  return { ok: false, action: "chromeWaitForSelector", selector, found: false, timeout, logs: readChromeLogs({ maxLogs: payload.maxLogs || 100 }) };
}

/**
 * B"H
 * Clicks an element.
 *
 * @param {object} payload Payload.
 * @returns {Promise<object>} Result.
 */
async function chromeClick(payload = {}) {
  const config = loadConfig();
  const blocked = requireChromeEnabled(config, "chromeClick");
  if (blocked) return blocked;

  const port = Number(payload.port || config.chrome.port || 9222);
  await ensurePage(port);

  const selector = payload.selector;
  if (!selector) return { ok: false, action: "chromeClick", error: "missing_selector" };

  const expression = `
    (() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return { ok: false, error: "not_found" };
      el.scrollIntoView({ block: "center", inline: "center" });
      el.click();
      return { ok: true, text: el.innerText || el.value || el.getAttribute("aria-label") || "" };
    })()
  `;

  const result = await cdpCall("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  return { ok: true, action: "chromeClick", selector, result, logs: readChromeLogs({ maxLogs: payload.maxLogs || 100 }) };
}

/**
 * B"H
 * Types into an element.
 *
 * @param {object} payload Payload.
 * @returns {Promise<object>} Result.
 */
async function chromeType(payload = {}) {
  const config = loadConfig();
  const blocked = requireChromeEnabled(config, "chromeType");
  if (blocked) return blocked;

  const port = Number(payload.port || config.chrome.port || 9222);
  await ensurePage(port);

  const selector = payload.selector;
  const text = payload.text || "";
  if (!selector) return { ok: false, action: "chromeType", error: "missing_selector" };

  const expression = `
    (() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return { ok: false, error: "not_found" };
      el.focus();
      el.value = ${JSON.stringify(text)};
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return { ok: true, value: el.value };
    })()
  `;

  const result = await cdpCall("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  return { ok: true, action: "chromeType", selector, textLength: text.length, result, logs: readChromeLogs({ maxLogs: payload.maxLogs || 100 }) };
}

/**
 * B"H
 * Returns current Chrome logs without shell access.
 *
 * @param {object} payload Payload.
 * @returns {Promise<object>} Logs result.
 */
async function chromeLogs(payload = {}) {
  return { ok: true, action: "chromeLogs", ...readChromeLogs({ maxLogs: payload.maxLogs || 300, clear: !!payload.clearLogs }) };
}

/**
 * B"H
 * Returns page snapshot plus logs.
 *
 * @param {object} payload Payload.
 * @returns {Promise<object>} Snapshot result.
 */
async function chromeSnapshot(payload = {}) {
  const config = loadConfig();
  const blocked = requireChromeEnabled(config, "chromeSnapshot");
  if (blocked) return blocked;

  const port = Number(payload.port || config.chrome.port || 9222);
  await ensurePage(port);

  return { ok: true, action: "chromeSnapshot", ...(await pageSnapshot(payload)) };
}

/**
 * B"H
 * Runs a script of browser steps.
 *
 * @param {object} payload Payload.
 * @returns {Promise<object>} Result.
 */
async function chromeRunScript(payload = {}) {
  const steps = Array.isArray(payload.script) ? payload.script : [];
  const results = [];

  const dispatch = {
    goto: step => chromeNavigate({ ...payload, url: step.url, timeoutMs: step.timeoutMs || payload.timeoutMs }),
    navigate: step => chromeNavigate({ ...payload, url: step.url, timeoutMs: step.timeoutMs || payload.timeoutMs }),
    waitForSelector: step => chromeWaitForSelector({ ...payload, selector: step.selector, timeoutMs: step.timeoutMs || payload.timeoutMs }),
    wait: step => chromeWaitForSelector({ ...payload, selector: step.selector, timeoutMs: step.timeoutMs || payload.timeoutMs }),
    click: step => chromeClick({ ...payload, selector: step.selector }),
    type: step => chromeType({ ...payload, selector: step.selector, text: step.text || "" }),
    eval: step => chromeEval({ ...payload, expression: step.expression || "document.title" }),
    logs: step => chromeLogs({ ...payload, ...step }),
    snapshot: step => chromeSnapshot({ ...payload, ...step })
  };

  for (const step of steps) {
    const type = step.type || step.action;
    results.push(dispatch[type] ? await dispatch[type](step) : { ok: false, error: "unknown_step", step });
  }

  return {
    ok: results.every(x => x.ok !== false),
    action: "chromeRunScript",
    count: steps.length,
    results,
    logs: readChromeLogs({ maxLogs: payload.maxLogs || 200 })
  };
}

module.exports = {
  chromeFind,
  chromeLaunch,
  chromeStatus,
  chromeNavigate,
  chromeEval,
  chromeWaitForSelector,
  chromeClick,
  chromeType,
  chromeLogs,
  chromeSnapshot,
  chromeRunScript
};
