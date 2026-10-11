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

/** @param {string|string[]} modifiers Modifier list or bitmask. @returns {number} */
export function normalizeModifiers(modifiers) {
  if (typeof modifiers === "number") return modifiers;
  let mask = 0;
  for (const name of Array.isArray(modifiers) ? modifiers : String(modifiers || "").split(/[+,\s]+/)) {
    const lower = String(name).toLowerCase();
    if (lower === "alt") mask |= 1;
    else if (lower === "ctrl" || lower === "control") mask |= 2;
    else if (lower === "meta" || lower === "command" || lower === "cmd") mask |= 4;
    else if (lower === "shift") mask |= 8;
  }
  return mask;
}

const US_KEY_CODES = {
  enter: 13, tab: 9, backspace: 8, escape: 27, " ": 32, space: 32,
  arrowleft: 37, arrowup: 38, arrowright: 39, arrowdown: 40, delete: 46,
  home: 36, end: 35, pageup: 33, pagedown: 34, insert: 45, f1: 112, f2: 113,
  f3: 114, f4: 115, f5: 116, f6: 117, f7: 118, f8: 119, f9: 120, f10: 121,
  f11: 122, f12: 123
};

/** @param {string} key Key name or character. @returns {number} */
export function windowsKeyCodeFor(key) {
  const lower = String(key || "").toLowerCase();
  if (US_KEY_CODES[lower]) return US_KEY_CODES[lower];
  if (lower.length === 1) {
    const upper = lower.toUpperCase();
    const code = upper.charCodeAt(0);
    if (code >= 48 && code <= 57) return code;
    if (code >= 65 && code <= 90) return code;
  }
  return 0;
}

/**
 * B"H
 * Dispatch a key event into the page through CDP Input. keyDown fires
 * keydown, type 'char' fires keypress, keyUp fires keyup. code and modifiers
 * ride along so page handlers see faithful e.key/e.code/e.shiftKey etc.
 */
export async function dispatchKeyEvent(cdp, { type = "keyDown", key = "", code = "", text = "", modifiers = 0, timeoutMs = 5000 } = {}) {
  const params = { type, modifiers: normalizeModifiers(modifiers) };
  if (key) params.key = String(key);
  if (code) params.code = String(code);
  if (text) params.text = String(text);
  const vk = windowsKeyCodeFor(code && String(code).startsWith("Key") ? code.slice(3) : key);
  if (vk) params.windowsVirtualKeyCode = vk;
  const result = await cdp.send("Input.dispatchKeyEvent", params, timeoutMs);
  if (result.error) throw new Error(result.error.message || JSON.stringify(result.error));
  return { type, key, code, modifiers: params.modifiers };
}

/**
 * B"H
 * Dispatch a mouse event into the page through CDP Input. mousePressed +
 * mouseReleased on a button produce mousedown/mouseup/click; mouseMoved
 * produces mousemove/mouseover (hover); mouseWheel produces wheel events
 * that scroll a scrollable page.
 */
export async function dispatchMouseEvent(cdp, { type = "mouseMoved", x = 0, y = 0, button = "left", clickCount = 0, deltaX = 0, deltaY = 0, modifiers = 0, timeoutMs = 5000 } = {}) {
  const params = { type, x: Number(x), y: Number(y), modifiers: normalizeModifiers(modifiers) };
  if (type === "mousePressed" || type === "mouseReleased") params.button = button;
  if (clickCount) params.clickCount = Number(clickCount);
  if (type === "mouseWheel") { params.deltaX = Number(deltaX); params.deltaY = Number(deltaY); }
  const result = await cdp.send("Input.dispatchMouseEvent", params, timeoutMs);
  if (result.error) throw new Error(result.error.message || JSON.stringify(result.error));
  return { type, x: params.x, y: params.y };
}

/** @param {object} cdp CDP client. @param {string} selector CSS selector. @returns {Promise<{x:number,y:number,width:number,height:number}>} */
export async function elementCenter(cdp, selector) {
  const rect = await evaluatePage(cdp, `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, width: r.width, height: r.height }; })()`);
  if (!rect) throw new Error(`Missing selector for coordinates: ${selector}`);
  return rect;
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
