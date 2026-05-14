
// B"H

const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const { ROOT, loadConfig, saveConfigPatch } = require("../../lib/config.js");
const { findChrome, chromeCandidates } = require("./finder.js");
const {
  version,
  pages,
  ensurePage,
  cdpCall,
  navigateAndWait
} = require("./cdp.js");

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function requireChromeControlEnabled(config, action) {
  if (!config.tools.chrome) {
    return {
      ok: false,
      action,
      error: "chrome_disabled",
      message: "Enable Chrome tool in dashboard and Save Config, or launch Chrome once from the control panel."
    };
  }

  return null;
}

function chromeFind() {
  const config = loadConfig();
  const found = config.chrome?.path || findChrome();

  return {
    ok: true,
    action: "chromeFind",
    chromePath: found,
    candidates: chromeCandidates(),
    configChrome: config.chrome || {}
  };
}

async function chromeLaunch(payload = {}) {
  const config = loadConfig();

  const port = Number(payload.port || config.chrome.port || 9222);
  const chromePath = payload.chromePath || config.chrome.path || findChrome();

  if (!chromePath) {
    return {
      ok: false,
      action: "chromeLaunch",
      error: "chrome_not_found",
      candidates: chromeCandidates(),
      message: "Paste Chrome path into dashboard or use chromeFind."
    };
  }

  const userDataDir = payload.userDataDir || config.chrome.userDataDir || path.join(ROOT, "chrome-profile");

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

  await wait(1800);
  await ensurePage(port);

  return {
    ok: true,
    action: "chromeLaunch",
    chromePath,
    port,
    userDataDir
  };
}

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
      candidates: chromeCandidates(),
      error: e.message
    };
  }
}

async function chromeNavigate(payload = {}) {
  const config = loadConfig();
  const blocked = requireChromeControlEnabled(config, "chromeNavigate");
  if (blocked) return blocked;

  const port = Number(payload.port || config.chrome.port || 9222);

  await ensurePage(port);

  const url = payload.url || "about:blank";
  const nav = await navigateAndWait(url, payload.timeoutMs || 15000, port);

  return {
    ok: true,
    action: "chromeNavigate",
    url,
    navigation: nav
  };
}

async function chromeEval(payload = {}) {
  const config = loadConfig();
  const blocked = requireChromeControlEnabled(config, "chromeEval");
  if (blocked) return blocked;

  const port = Number(payload.port || config.chrome.port || 9222);

  await ensurePage(port);

  const expression = payload.expression || "document.title";
  const result = await cdpCall("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });

  return {
    ok: true,
    action: "chromeEval",
    expression,
    result
  };
}

async function chromeWaitForSelector(payload = {}) {
  const config = loadConfig();
  const blocked = requireChromeControlEnabled(config, "chromeWaitForSelector");
  if (blocked) return blocked;

  const port = Number(payload.port || config.chrome.port || 9222);

  await ensurePage(port);

  const selector = payload.selector;
  const timeout = Number(payload.timeoutMs || 10000);

  if (!selector) {
    return {
      ok: false,
      action: "chromeWaitForSelector",
      error: "missing_selector"
    };
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

  return {
    ok: false,
    action: "chromeWaitForSelector",
    selector,
    found: false,
    timeout
  };
}

async function chromeClick(payload = {}) {
  const config = loadConfig();
  const blocked = requireChromeControlEnabled(config, "chromeClick");
  if (blocked) return blocked;

  const port = Number(payload.port || config.chrome.port || 9222);

  await ensurePage(port);

  const selector = payload.selector;

  if (!selector) {
    return {
      ok: false,
      action: "chromeClick",
      error: "missing_selector"
    };
  }

  const expression = `
    (() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return { ok: false, error: "not_found" };
      el.scrollIntoView({ block: "center", inline: "center" });
      el.click();
      return {
        ok: true,
        text: el.innerText || el.value || el.getAttribute("aria-label") || "",
        tagName: el.tagName
      };
    })()
  `;

  const result = await cdpCall("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });

  return {
    ok: true,
    action: "chromeClick",
    selector,
    result
  };
}

async function chromeType(payload = {}) {
  const config = loadConfig();
  const blocked = requireChromeControlEnabled(config, "chromeType");
  if (blocked) return blocked;

  const port = Number(payload.port || config.chrome.port || 9222);

  await ensurePage(port);

  const selector = payload.selector;
  const text = payload.text || "";

  if (!selector) {
    return {
      ok: false,
      action: "chromeType",
      error: "missing_selector"
    };
  }

  const expression = `
    (() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return { ok: false, error: "not_found" };
      el.focus();
      if ("value" in el) el.value = ${JSON.stringify(text)};
      else el.textContent = ${JSON.stringify(text)};
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return { ok: true, value: el.value || el.textContent || "" };
    })()
  `;

  const result = await cdpCall("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });

  return {
    ok: true,
    action: "chromeType",
    selector,
    textLength: text.length,
    result
  };
}

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
      results.push(await chromeClick({
        ...payload,
        selector: step.selector
      }));
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
      results.push({
        ok: false,
        error: "unknown_step",
        step
      });
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
