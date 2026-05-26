// B"H
/**
 * NativeCapabilityBridge maps compact native ids/names to host objects.
 * It does not reimplement the world; it safely delegates to supplied
 * browser/node/worker capabilities when the host chooses to expose them.
 */
const { createDocumentStub } = require('./WebBinaryRuntime.js');

function safeRequire(name) {
  try { return require(name); } catch { return undefined; }
}
function defaultNodeCaps() {
  return {
    fs: safeRequire('fs'), 'fs/promises': safeRequire('fs/promises'),
    path: safeRequire('path'), os: safeRequire('os'), crypto: safeRequire('crypto'),
    util: safeRequire('util'), events: safeRequire('events'), stream: safeRequire('stream'),
    Buffer, process, console, URL, URLSearchParams, TextEncoder, TextDecoder,
    setTimeout, clearTimeout, setInterval, clearInterval, queueMicrotask
  };
}
function defaultBrowserCaps() {
  const document = createDocumentStub();
  return { document, window: { document }, self: { document }, Event: globalThis.Event || class Event { constructor(type) { this.type = type; } } };
}
function makeWorkerCaps() {
  const listeners = {};
  const messages = [];
  const self = {
    postMessage(value) { messages.push(value); (listeners.message || []).forEach(fn => fn({ data: value })); },
    addEventListener(type, fn) { listeners[type] = listeners[type] || []; listeners[type].push(fn); },
    removeEventListener(type, fn) { listeners[type] = (listeners[type] || []).filter(x => x !== fn); },
    dispatchEvent(event) { (listeners[event.type] || []).forEach(fn => fn(event)); return true; }
  };
  return { WorkerGlobalScope: self, DedicatedWorkerGlobalScope: self, self, messages };
}
function createNativeCapabilityBridge(options = {}) {
  const caps = { ...defaultNodeCaps(), ...defaultBrowserCaps(), ...makeWorkerCaps(), ...(options.capabilities || {}) };
  const resolve = path => String(path).split('.').filter(Boolean).reduce((obj, key) => obj?.[key], caps);
  const call = (path, ...args) => {
    const parts = String(path).split('.').filter(Boolean);
    const name = parts.pop();
    const owner = parts.length ? resolve(parts.join('.')) : caps;
    const fn = owner?.[name];
    if (typeof fn !== 'function') throw new Error(`Native capability is not callable: ${path}`);
    return fn.apply(owner, args);
  };
  const get = path => resolve(path);
  const set = (path, value) => {
    const parts = String(path).split('.').filter(Boolean);
    const key = parts.pop();
    const owner = parts.length ? resolve(parts.join('.')) : caps;
    if (!owner) throw new Error(`Native capability parent missing: ${path}`);
    owner[key] = value;
    return value;
  };
  return { capabilities: caps, get, set, call, has: path => get(path) !== undefined };
}
module.exports = { createNativeCapabilityBridge };
