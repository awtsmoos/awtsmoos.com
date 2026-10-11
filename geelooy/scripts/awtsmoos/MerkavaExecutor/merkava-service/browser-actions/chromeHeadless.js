// B"H
/**
 * @file chromeHeadless.js
 * @description
 * The tunnel path's real browser eye. When the render lab runs with
 * mode=chrome-if-available and the vessel has Chrome, this module launches a
 * throwaway headless Chrome, loads the page HTML from a temp file, waits for
 * scripts to run to completion, dispatches real input events through CDP
 * (Input.dispatchKeyEvent / Input.dispatchMouseEvent, incl. mouseWheel),
 * evaluates return values, and captures a real PNG screenshot.
 *
 * Honest contract: FULL page JS execution and faithful input events are ONLY
 * possible through this Chrome backend. Merkava's native software renderer is
 * static-only and has no JS engine.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";
import { pathToFileURL } from "url";
import { findChromeExecutable } from "../snapshots/chromeScreenshot.js";
import { connectCdp, enableBrowserDomains, evaluatePage } from "./cdpClient.js";
import { runPageActions } from "./pageActions.js";

const DEFAULT_TIMEOUT_MS = 60000;
const DEFAULT_SETTLE_MS = 4000;

function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try { const parsed = JSON.parse(String(value)); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}

/** @param {object} options Options. @returns {Promise<{endpoint:string,child:ChildProcess,dir:string}>} */
async function launchChrome({ chrome, width, height, profileDir, timeoutMs }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "merkava-chrome-"));
  const htmlPath = path.join(dir, "index.html");
  const child = spawn(chrome, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    `--window-size=${width},${height}`,
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDir || path.join(dir, "profile")}`,
    "about:blank"
  ], { stdio: ["ignore", "ignore", "pipe"] });
  const endpoint = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("chrome_devtools_endpoint_timeout")), Math.min(timeoutMs, 20000));
    let buf = "";
    child.stderr.on("data", chunk => {
      buf += String(chunk);
      const match = buf.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:\d+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
    child.on("error", error => { clearTimeout(timer); reject(error); });
    child.on("exit", code => { clearTimeout(timer); reject(new Error(`chrome exited before DevTools endpoint (code ${code}): ${buf.slice(-400)}`)); });
  });
  return { endpoint, child, dir, htmlPath };
}

async function findPageTarget(endpoint, timeoutMs) {
  const httpBase = endpoint.replace(/^ws:\/\/([^/]+).*/, "http://$1");
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const targets = await (await fetch(`${httpBase}/json/list`)).json();
      const page = (Array.isArray(targets) ? targets : []).find(t => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page;
    } catch (_) {}
    await wait(150);
  }
  throw new Error("no_chrome_page_target");
}

async function waitForLoad(cdp, settleMs, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const state = await evaluatePage(cdp, "document.readyState").catch(() => "loading");
    if (state === "complete") break;
    await wait(120);
  }
  const settleStart = Date.now();
  let lastHtml = -1, stable = 0;
  while (Date.now() - settleStart < settleMs) {
    const htmlLength = await evaluatePage(cdp, "document.documentElement ? document.documentElement.outerHTML.length : 0").catch(() => 0);
    if (htmlLength === lastHtml) { stable++; if (stable >= 3 && htmlLength > 0) break; }
    else { stable = 0; lastHtml = htmlLength; }
    await wait(200);
  }
}

async function collectValues(cdp, keys = []) {
  const values = {}, errors = {};
  for (const key of keys) {
    const expr = String(key);
    try { values[expr] = await evaluatePage(cdp, `(${expr})`); }
    catch (error) { errors[expr] = error.message; }
  }
  return { values, errors };
}

async function domTree(cdp, maxDepth = 5) {
  return evaluatePage(cdp, `(() => {
    const walk = (node, depth) => {
      if (!node || depth > ${maxDepth}) return null;
      const localName = String(node.localName || "unknown").toLowerCase();
      return {
        tagName: node.tagName || localName,
        localName,
        nodeType: node.nodeType || 1,
        id: node.id || "",
        className: node.className || "",
        textContent: (localName === "script" || localName === "style") ? "" : String(node.textContent || "").slice(0, 200),
        children: Array.from(node.children || []).map(c => walk(c, depth + 1)).filter(Boolean)
      };
    };
    return walk(document.documentElement, 0);
  })()`).catch(() => null);
}

/** @param {object} options Run options. @returns {Promise<object>} Chrome-backed run result. */
export async function runChromeHeadless(options = {}) {
  const startedAt = new Date().toISOString();
  const chrome = findChromeExecutable();
  if (!chrome) return { ok: false, chromeNotFound: true, engine: "chrome-headless-cdp", error: "chrome_not_found" };
  const width = Number(options.width || options.viewportWidth || 960);
  const height = Number(options.height || options.viewportHeight || 640);
  const timeoutMs = Number(options.timeoutMs || DEFAULT_TIMEOUT_MS);
  const settleMs = Number(options.settleMs ?? DEFAULT_SETTLE_MS);
  const html = String(options.html || options.content || "<!doctype html><html><body><h1>B\"H</h1></body></html>");
  const interactions = normalizeList(options.interactions || options.actions || options.browserActions);
  const returnValues = normalizeList(options.returnValues || options.values);

  let launched = null, cdp = null;
  const consoleEntries = [], exceptions = [];
  try {
    launched = await launchChrome({ chrome, width, height, timeoutMs });
    fs.writeFileSync(launched.htmlPath, html, "utf8");
    const target = await findPageTarget(launched.endpoint, Math.min(timeoutMs, 15000));
    cdp = await connectCdp(target.webSocketDebuggerUrl);
    await enableBrowserDomains(cdp);
    cdp.events.push = ((push) => function (entry) {
      try {
        if (entry?.method === "Runtime.consoleAPICalled") consoleEntries.push({ type: entry.params?.type, args: (entry.params?.args || []).map(a => a.value ?? a.description ?? a.type) });
        else if (entry?.method === "Runtime.exceptionThrown") exceptions.push({ text: entry.params?.exceptionDetails?.text, exception: entry.params?.exceptionDetails?.exception?.description });
        else if (entry?.method === "Log.entryAdded") consoleEntries.push({ type: "log", text: entry.params?.entry?.text, level: entry.params?.entry?.level });
      } catch (_) {}
      return push.call(this, entry);
    })(cdp.events.push);
    // Navigate the attached page to our HTML file; scripts run for real here.
    const fileUrl = pathToFileURL(launched.htmlPath).href;
    await cdp.send("Page.navigate", { url: fileUrl }, Math.min(timeoutMs, 15000));
    await waitForLoad(cdp, settleMs, timeoutMs);
    const interactionLog = await runPageActions(cdp, interactions);
    if (interactionLog.length) await wait(Number(options.afterActionSettleMs ?? 400));
    const { values, errors: valueErrors } = await collectValues(cdp, returnValues);
    const tree = await domTree(cdp);
    const shot = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }, 15000);
    if (shot.error) throw new Error(shot.error.message || "screenshot_failed");
    const pngBytes = Buffer.from(shot.result.data, "base64");
    return {
      ok: true,
      chromeNotFound: false,
      engine: "chrome-headless-cdp",
      browserRuntime: true,
      runtime: "browser",
      startedAt,
      endedAt: new Date().toISOString(),
      chrome,
      url: fileUrl,
      target: { id: target.id, type: target.type, title: target.title, url: target.url },
      values,
      valueErrors,
      console: consoleEntries,
      exceptions,
      errors: exceptions.map(e => ({ message: e.text || e.exception || "page_exception" })),
      interactionLog,
      interactions,
      screenshot: {
        backend: "chrome-headless-cdp",
        width, height,
        bytes: pngBytes.length,
        mimeType: "image/png",
        dataUrl: `data:image/png;base64,${shot.result.data}`,
        proof: { chrome, bytes: pngBytes.length, realBrowser: true },
        fallbackReason: null
      },
      dom: tree
    };
  } catch (error) {
    return {
      ok: false,
      chromeNotFound: false,
      engine: "chrome-headless-cdp",
      browserRuntime: true,
      runtime: "browser",
      startedAt,
      endedAt: new Date().toISOString(),
      chrome,
      error: error.message,
      stack: error.stack || "",
      errors: [{ message: error.message }],
      console: consoleEntries,
      exceptions,
      values: {},
      valueErrors: {},
      interactionLog: [],
      interactions,
      screenshot: null,
      dom: null
    };
  } finally {
    try { cdp?.close(); } catch (_) {}
    try { launched?.child?.kill("SIGKILL"); } catch (_) {}
    try { fs.rmSync(launched?.dir || "", { recursive: true, force: true }); } catch (_) {}
  }
}
