// B"H
/**
 * @file cdpClient.js
 * @description A tiny DevTools bridge with command timeouts. The Awtsmoos opens
 * Chrome's speaking socket, but no missing DevTools reply may freeze the whole
 * witness. Every command either returns or burns with a named timeout.
 */

/** @param {string} endpoint Chrome JSON endpoint. @returns {Promise<Array>} */
export async function listTargets(endpoint = "http://127.0.0.1:9222/json") {
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`Chrome target list failed: ${response.status}`);
  return response.json();
}

/** @param {string} url Target URL fragment. @returns {Promise<object>} */
export async function findPageTarget(url = "") {
  const targets = await listTargets();
  const pages = targets.filter(target => target.type === "page" && target.webSocketDebuggerUrl);
  const match = pages.find(page => String(page.url || "").includes(url)) || pages[0];
  if (!match) throw new Error("No Chrome page target is available on 127.0.0.1:9222");
  return match;
}

/** @param {string} webSocketDebuggerUrl DevTools websocket. @returns {Promise<object>} */
export async function connectCdp(webSocketDebuggerUrl) {
  if (typeof WebSocket === "undefined") throw new Error("Node WebSocket global is unavailable");
  const ws = new WebSocket(webSocketDebuggerUrl);
  const pending = new Map();
  const events = [];
  let id = 1;
  ws.onmessage = event => handleMessage(event, pending, events);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
    setTimeout(() => reject(new Error("Chrome DevTools websocket open timed out")), 5000);
  });
  const send = (method, params = {}, timeoutMs = 5000) => sendCdp(ws, pending, id++, method, params, timeoutMs);
  return { send, events, close: () => closeSocket(ws, pending) };
}

/** @param {MessageEvent} event Event. @param {Map} pending Pending. @param {Array} events Events. */
function handleMessage(event, pending, events) {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const pendingCall = pending.get(message.id);
    clearTimeout(pendingCall.timer);
    pending.delete(message.id);
    pendingCall.resolve(message);
    return;
  }
  events.push({ at: new Date().toISOString(), ...message });
}

/** @param {WebSocket} ws Socket. @param {Map} pending Pending. @param {number} id Id. @param {string} method Method. @param {object} params Params. @param {number} timeoutMs Timeout. */
function sendCdp(ws, pending, id, method, params, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`CDP command timed out: ${method}`));
    }, timeoutMs);
    pending.set(id, { resolve, reject, timer, method });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

/** @param {WebSocket} ws Socket. @param {Map} pending Pending. */
function closeSocket(ws, pending) {
  for (const [id, call] of pending) {
    clearTimeout(call.timer);
    call.reject?.(new Error(`CDP socket closed before ${call.method}`));
    pending.delete(id);
  }
  try { ws.close(); } catch (_) {}
}

/** @param {object} cdp CDP client. @returns {Promise<void>} */
export async function enableBrowserDomains(cdp) {
  await cdp.send("Runtime.enable");
  await cdp.send("Page.enable");
  await cdp.send("Network.enable");
  await cdp.send("Log.enable").catch(() => null);
}

/** @param {object} cdp CDP client. @param {string} expression JS expression. @returns {Promise<unknown>} */
export async function evaluatePage(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }, 8000);
  if (result.error) throw new Error(result.error.message || JSON.stringify(result.error));
  const remote = result.result?.result;
  if (remote?.subtype === "error") throw new Error(remote.description || remote.value || "Page evaluation failed");
  return remote?.value;
}

/** @param {object} cdp CDP client. @param {string} url URL. @param {number} timeoutMs Timeout. */
export async function navigatePage(cdp, url, timeoutMs = 15000) {
  await cdp.send("Page.navigate", { url }, 8000);
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const ready = await evaluatePage(cdp, "document.readyState").catch(() => "loading");
    if (ready === "complete") return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Page navigation timed out: ${url}`);
}
