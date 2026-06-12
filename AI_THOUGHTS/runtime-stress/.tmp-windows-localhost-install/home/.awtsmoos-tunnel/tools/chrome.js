
// B"H
const fs = require("fs");
const path = require("path");
const http = require("http");
const childProcess = require("child_process");
const os = require("os");
const { TinyWebSocket } = require("../lib/ws.js");
const { loadConfig, saveConfigPatch, ROOT } = require("../lib/config.js");

let chromeProcess = null;
let cdp = null;
let nextId = 1;
const callbacks = new Map();

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch (e) {
    return false;
  }
}

function findChrome() {
  const candidates = [];

  if (process.platform === "win32") {
    candidates.push(
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      path.join(os.homedir(), "AppData\\Local\\Google\\Chrome\\Application\\chrome.exe"),
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
    );
  } else if (process.platform === "darwin") {
    candidates.push(
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
    );
  } else {
    candidates.push("/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge");
  }

  return candidates.find(exists) || "";
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

async function version(port) {
  return await getJson("http://127.0.0.1:" + port + "/json/version");
}

async function pages(port) {
  return await getJson("http://127.0.0.1:" + port + "/json");
}

async function connectCdp(port) {
  const info = await version(port);
  const wsUrl = info.webSocketDebuggerUrl;

  cdp = new TinyWebSocket(wsUrl);

  cdp.on("message", msg => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      return;
    }

    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);

      if (data.error) cb.reject(new Error(JSON.stringify(data.error)));
      else cb.resolve(data.result);
    }
  });

  await new Promise((resolve, reject) => {
    cdp.once("open", resolve);
    cdp.once("error", reject);
    cdp.connect();
  });

  return true;
}

function cdpCall(method, params = {}) {
  if (!cdp || !cdp.opened) {
    throw new Error("Chrome DevTools is not connected. Launch Chrome first.");
  }

  const id = nextId++;
  cdp.sendJson({ id, method, params });

  return new Promise((resolve, reject) => {
    callbacks.set(id, { resolve, reject });
    setTimeout(() => {
      if (callbacks.has(id)) {
        callbacks.delete(id);
        reject(new Error("CDP timeout for " + method));
      }
    }, 15000);
  });
}

async function launchChrome(payload = {}) {
  const config = loadConfig();
  const port = Number(payload.port || config.chrome.port || 9222);
  const chromePath = payload.path || config.chrome.path || findChrome();

  if (!chromePath) {
    return { ok: false, error: "chrome_not_found", message: "Set Chrome path manually in config." };
  }

  const userDataDir = payload.userDataDir || config.chrome.userDataDir || path.join(ROOT, "chrome-profile");

  fs.mkdirSync(userDataDir, { recursive: true });

  const args = [
    "--remote-debugging-port=" + port,
    "--user-data-dir=" + userDataDir,
    "--no-first-run",
    "--no-default-browser-check"
  ];

  chromeProcess = childProcess.spawn(chromePath, args, {
    detached: true,
    stdio: "ignore"
  });

  chromeProcess.unref();

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

  await new Promise(resolve => setTimeout(resolve, 1200));
  await connectCdp(port);

  return {
    ok: true,
    action: "chromeLaunch",
    chromePath,
    port,
    userDataDir
  };
}

async function ensureConnected() {
  const config = loadConfig();
  if (!cdp || !cdp.opened) {
    await connectCdp(config.chrome.port || 9222);
  }
}

async function navigate(payload = {}) {
  await ensureConnected();

  const url = payload.url || "about:blank";

  await cdpCall("Target.createTarget", { url });
  const list = await pages(loadConfig().chrome.port || 9222);

  return {
    ok: true,
    action: "chromeNavigate",
    url,
    pages: list.map(p => ({ id: p.id, title: p.title, url: p.url }))
  };
}

async function evaluate(payload = {}) {
  await ensureConnected();

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

async function waitForSelector(payload = {}) {
  await ensureConnected();

  const selector = payload.selector;
  const timeout = Number(payload.timeout || 10000);

  if (!selector) {
    return { ok: false, error: "missing_selector" };
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

    await new Promise(resolve => setTimeout(resolve, 250));
  }

  return { ok: false, action: "chromeWaitForSelector", selector, found: false, timeout };
}

async function chromeStatus() {
  const config = loadConfig();
  const port = Number(config.chrome.port || 9222);

  try {
    const info = await version(port);
    return {
      ok: true,
      action: "chromeStatus",
      connected: !!(cdp && cdp.opened),
      port,
      info
    };
  } catch (e) {
    return {
      ok: true,
      action: "chromeStatus",
      connected: false,
      port,
      error: e.message
    };
  }
}

async function handleChrome(payload = {}) {
  const action = payload.action;

  if (action === "chromeFind") {
    return { ok: true, action, chromePath: findChrome() };
  }

  if (action === "chromeLaunch") return await launchChrome(payload);
  if (action === "chromeStatus") return await chromeStatus();
  if (action === "chromeNavigate") return await navigate(payload);
  if (action === "chromeEval") return await evaluate(payload);
  if (action === "chromeWaitForSelector") return await waitForSelector(payload);

  return { ok: false, error: "unknown_chrome_action", action };
}

module.exports = { handleChrome };
