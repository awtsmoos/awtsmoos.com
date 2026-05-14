
// B"H
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const { ROOT, loadConfig, saveConfigPatch } = require("../../lib/config.js");
const { findChrome, chromeCandidates } = require("./finder.js");
const { version, pages, connectCdp, ensureCdp, cdpCall } = require("./cdp.js");

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

async function chromeFind() {
  return {
    ok: true,
    action: "chromeFind",
    chromePath: findChrome(),
    candidates: chromeCandidates()
  };
}

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

  await wait(1500);
  await connectCdp(port);

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
      info,
      pages: list.map(p => ({ id: p.id, title: p.title, url: p.url }))
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
  const blocked = requireChromeEnabled(config, "chromeNavigate");
  if (blocked) return blocked;

  const port = Number(payload.port || config.chrome.port || 9222);
  await ensureCdp(port);

  const url = payload.url || "about:blank";
  const target = await cdpCall("Target.createTarget", { url });

  return {
    ok: true,
    action: "chromeNavigate",
    url,
    target
  };
}

async function chromeEval(payload = {}) {
  const config = loadConfig();
  const blocked = requireChromeEnabled(config, "chromeEval");
  if (blocked) return blocked;

  const port = Number(payload.port || config.chrome.port || 9222);
  await ensureCdp(port);

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
  const blocked = requireChromeEnabled(config, "chromeWaitForSelector");
  if (blocked) return blocked;

  const port = Number(payload.port || config.chrome.port || 9222);
  await ensureCdp(port);

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
      return { ok: true, action: "chromeWaitForSelector", selector, found: true };
    }

    await wait(250);
  }

  return { ok: false, action: "chromeWaitForSelector", selector, found: false, timeout };
}

module.exports = {
  chromeFind,
  chromeLaunch,
  chromeStatus,
  chromeNavigate,
  chromeEval,
  chromeWaitForSelector
};
