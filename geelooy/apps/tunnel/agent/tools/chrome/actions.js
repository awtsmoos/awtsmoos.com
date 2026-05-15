
// B"H

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const { ROOT, loadConfig, saveConfigPatch } = require("../../lib/config.js");
const {
  findChrome,
  chromeCandidates,
  chromeFindDetails
} = require("./finder.js");

const {
  version,
  pages,
  ensurePage,
  cdpCall,
  navigateAndWait
} = require("./cdp.js");

/**
 * B"H
 * Waits.
 *
 * @param {number} ms Milliseconds.
 * @returns {Promise<void>} Done.
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * B"H
 * Requires Chrome permission for actions that control browser state.
 *
 * @param {object} config Agent config.
 * @param {string} action Action.
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
 * Finds Chrome/Edge/Brave/Chromium and returns strong diagnostics.
 *
 * @returns {Promise<object>} Finder response.
 */
async function chromeFind() {
  return {
    ok: true,
    action: "chromeFind",
    ...chromeFindDetails()
  };
}

/**
 * B"H
 * Launches or connects to Chrome with remote debugging.
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

  const userDataDir =
    payload.userDataDir ||
    config.chrome.userDataDir ||
    path.join(ROOT, "chrome-profile");

  fs.mkdirSync(userDataDir, { recursive: true });

  childProcess.spawn(chromePath, [
    "--remote-debugging-port=" + port,
    "--user-data-dir=" + userDataDir,
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank"
  ], {
    detached: true,
    stdio: "ignore"
  }).unref();

  saveConfigPatch({
    chrome: {
      enabled: true,
      path: chromePath,
      port,
      userDataDir
    },
    tools: {
      chrome: true
    }
  });

  await wait(1600);
  await ensurePage(port);

  return {
    ok: true,
    action: "chromeLaunch",
    chromePath,
    port,
    userDataDir
  };
}

/**
 * B"H
 * Checks Chrome status.
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
      info,
      pages: list.map(p => ({
        id: p.id,
        title: p.title,
        url: p.url,
        type: p.type
      }))
    };
  } catch (e) {
    return {
      ok: true,
      action: "chromeStatus",
      connected: false,
      port,
      chromePath: config.chrome.path || findChrome(),
      ...chromeFindDetails(),
      error: e.message
    };
  }
}

/**
 * B"H
 * Navigates the active Chrome page.
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

  const url = payload.url || "about:blank";
  const nav = await navigateAndWait(url, payload.timeoutMs || 15000);

  return { ok: true, action: "chromeNavigate", url, navigation: nav };
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
  const result = await cdpCall("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });

  return { ok: true, action: "chromeEval", expression, result };
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

  if (!selector) {
    return { ok: false, action: "chromeWaitForSelector", error: "missing_selector" };
  }

  const start = Date.now();

  while (Date.now() - start < timeout) {
    const result = await cdpCall("Runtime.evaluate", {
      expression: "!!document.querySelector(" + JSON.stringify(selector) + ")",
      returnByValue: true
    });

    if (result.result?.value) {
      return {
        ok: true,
        action: "chromeWaitForSelector",
        selector,
        found: true,
        durationMs: Date.now() - start
      };
    }

    await wait(250);
  }

  return { ok: false, action: "chromeWaitForSelector", selector, found: false, timeout };
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
      return {
        ok: true,
        text: el.innerText || el.value || el.getAttribute("aria-label") || ""
      };
    })()
  `;

  const result = await cdpCall("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });

  return { ok: true, action: "chromeClick", selector, result };
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

  const result = await cdpCall("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });

  return { ok: true, action: "chromeType", selector, textLength: text.length, result };
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

  for (const step of steps) {
    const type = step.type || step.action;

    if (type === "goto" || type === "navigate") {
      results.push(await chromeNavigate({
        ...payload,
        url: step.url,
        timeoutMs: step.timeoutMs || payload.timeoutMs
      }));
    } else if (type === "waitForSelector" || type === "wait") {
      results.push(await chromeWaitForSelector({
        ...payload,
        selector: step.selector,
        timeoutMs: step.timeoutMs || payload.timeoutMs
      }));
    } else if (type === "click") {
      results.push(await chromeClick({ ...payload, selector: step.selector }));
    } else if (type === "type") {
      results.push(await chromeType({
        ...payload,
        selector: step.selector,
        text: step.text || ""
      }));
    } else if (type === "eval") {
      results.push(await chromeEval({
        ...payload,
        expression: step.expression || "document.title"
      }));
    } else {
      results.push({ ok: false, error: "unknown_step", step });
    }
  }

  return {
    ok: results.every(x => x.ok !== false),
    action: "chromeRunScript",
    count: steps.length,
    results
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
  chromeRunScript
};
