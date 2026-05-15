// B"H

const http = require("http");
const { TinyWebSocket } = require("../../lib/ws.js");
const { captureCdpEvent } = require("./logs.js");

let pageWs = null;
let nextId = 1;
const callbacks = new Map();

/**
 * B"H
 * Fetches JSON from Chrome's local DevTools HTTP face.
 *
 * @param {string} url URL.
 * @returns {Promise<object>} Parsed JSON.
 */
function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      const chunks = [];

      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");

        try {
          resolve(JSON.parse(text));
        } catch (e) {
          reject(new Error("Bad JSON from " + url + ": " + text.slice(0, 200)));
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

async function newPage(port, url = "about:blank") {
  return await getJson("http://127.0.0.1:" + port + "/json/new?" + encodeURIComponent(url));
}

/**
 * B"H
 * Wires CDP responses and event sparks into one socket.
 *
 * @param {TinyWebSocket} ws Page websocket.
 * @returns {void}
 */
function wireSocket(ws) {
  ws.on("message", msg => {
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
      return;
    }

    if (data.method) captureCdpEvent(data);
  });

  ws.once("close", () => {
    pageWs = null;
    for (const cb of callbacks.values()) cb.reject(new Error("Chrome DevTools socket closed."));
    callbacks.clear();
  });
}

/**
 * B"H
 * Opens a page-level DevTools socket and enables log-bearing domains.
 *
 * @param {string} webSocketDebuggerUrl Page websocket URL.
 * @returns {Promise<TinyWebSocket>} Connected socket.
 */
async function connectPageWs(webSocketDebuggerUrl) {
  pageWs = new TinyWebSocket(webSocketDebuggerUrl);
  wireSocket(pageWs);

  await new Promise((resolve, reject) => {
    pageWs.once("open", resolve);
    pageWs.once("error", reject);
    pageWs.connect();
  });

  for (const method of ["Runtime.enable", "Page.enable", "DOM.enable", "Log.enable", "Network.enable"]) {
    try { await cdpCall(method); } catch (_e) {}
  }

  return pageWs;
}

/**
 * B"H
 * Ensures there is a page target to command.
 *
 * @param {number} port DevTools port.
 * @returns {Promise<TinyWebSocket>} Page socket.
 */
async function ensurePage(port) {
  if (pageWs && pageWs.opened) return pageWs;

  let list = [];

  try {
    list = await pages(port);
  } catch (e) {
    throw new Error("Chrome DevTools not reachable on port " + port + ": " + e.message);
  }

  let page = list.find(p => p.type === "page" && p.webSocketDebuggerUrl);
  if (!page) page = await newPage(port, "about:blank");

  if (!page.webSocketDebuggerUrl) throw new Error("No page websocket found.");

  return await connectPageWs(page.webSocketDebuggerUrl);
}

/**
 * B"H
 * Calls Chrome DevTools Protocol and waits for the answer.
 *
 * @param {string} method CDP method.
 * @param {object} [params] CDP params.
 * @param {number} [timeoutMs=30000] Timeout.
 * @returns {Promise<object>} CDP result.
 */
async function cdpCall(method, params = {}, timeoutMs = 30000) {
  if (!pageWs || !pageWs.opened) throw new Error("Page DevTools socket is not connected.");

  const id = nextId++;

  pageWs.sendJson({ id, method, params });

  return new Promise((resolve, reject) => {
    callbacks.set(id, { resolve, reject });

    const timer = setTimeout(() => {
      if (callbacks.has(id)) {
        callbacks.delete(id);
        reject(new Error("CDP timeout for " + method));
      }
    }, timeoutMs);

    timer.unref?.();
  });
}

/**
 * B"H
 * Navigates and waits until the page is alive enough to inspect.
 *
 * @param {string} url URL.
 * @param {number} [timeoutMs=15000] Timeout.
 * @param {number} [port=9222] DevTools port.
 * @returns {Promise<object>} Navigation state.
 */
async function navigateAndWait(url, timeoutMs = 15000, port = 9222) {
  await ensurePage(port);
  await cdpCall("Page.navigate", { url }, timeoutMs);

  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const state = await cdpCall("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true
    }, Math.min(timeoutMs, 30000));

    if (state.result?.value === "complete" || state.result?.value === "interactive") {
      return { ok: true, readyState: state.result.value, durationMs: Date.now() - start };
    }

    await new Promise(resolve => setTimeout(resolve, 250));
  }

  return { ok: false, readyState: "timeout", durationMs: Date.now() - start };
}

module.exports = {
  version,
  pages,
  newPage,
  ensurePage,
  cdpCall,
  navigateAndWait
};
