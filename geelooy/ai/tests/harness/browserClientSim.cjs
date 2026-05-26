//B"H
const vm = require("vm");
const { assert, test } = require("./assert.cjs");
const { jsPreamble } = require("../../relay/split-browser/jsPreamble.cjs");
const { browserRewriteScript } = require("../../relay/split-browser/browserRewrite.cjs");
const { autoLoginScript } = require("../../relay/split-browser/autoLogin.cjs");
const { debugClientScript } = require("../../relay/split-browser/debugClient.cjs");

/**
 * B"H — Executes the injected browser scripts inside a fake browser VM.
 *
 * This is still not Chrome, but it is much stronger than string checks: it
 * proves fetch, XMLHttpRequest, history, storage, popups, and login-click code
 * actually run against a local-origin browser-like object.
 */
async function run() {
  return test("browser-client-runtime-simulation", async () => {
    const calls = [];
    const opened = [];
    const beacons = [];
    const loginButton = makeElement("button", "Log in");
    const context = {
      console: { info: (...args) => calls.push(["console", ...args]) },
      URL,
      URLSearchParams,
      encodeURIComponent,
      setTimeout: fn => { if (typeof fn === "function") fn(); return 1; },
      setInterval: () => 1,
      clearTimeout: () => {},
      Blob: class Blob { constructor(parts, opts) { this.parts = parts; this.type = opts?.type || ""; } },
      InputEvent: class InputEvent { constructor(type, init) { this.type = type; this.init = init; } },
      Request: class Request { constructor(url, init = {}) { this.url = url; this.method = init.method || "GET"; this.headers = init.headers || {}; } clone() { return this; } },
      location: { href: "http://127.0.0.1:38488/chatgpt", origin: "http://127.0.0.1:38488" },
      navigator: { sendBeacon: (url, blob) => { beacons.push({ url, blob }); return true; } },
      addEventListener: (event, fn) => { if (event === "load") fn(); },
      getComputedStyle: () => ({ visibility: "visible", display: "block" }),
      localStorage: makeStorage(),
      sessionStorage: makeStorage(),
      indexedDB: { open: (...args) => calls.push(["indexedDB.open", ...args]), deleteDatabase: (...args) => calls.push(["indexedDB.deleteDatabase", ...args]) },
      history: { pushState: (...args) => calls.push(["pushState", ...args]), replaceState: (...args) => calls.push(["replaceState", ...args]) },
      document: {
        readyState: "complete",
        querySelectorAll: () => [loginButton],
        addEventListener: () => {}
      },
      fetch: async (url, init) => { calls.push(["fetch", url, init]); return { status: 200, headers: { get: () => "application/json" }, ok: true, json: async () => ({ ok: true, commands: [] }), url, init }; },
      XMLHttpRequest: makeXHR(calls),
      Location: function Location() {}
    };
    context.globalThis = context;
    context.window = context;
    context.Location.prototype.assign = function(url) { calls.push(["location.assign", url]); };
    context.Location.prototype.replace = function(url) { calls.push(["location.replace", url]); };
    context.location.__proto__ = context.Location.prototype;
    context.open = (url, name) => { opened.push({ url, name }); return { url, name }; };

    vm.runInNewContext(browserRewriteScript("https://chatgpt.com"), context);
    vm.runInNewContext(jsPreamble("https://chatgpt.com"), context);
    vm.runInNewContext(debugClientScript(), context);
    vm.runInNewContext(autoLoginScript(), context);

    await context.fetch("https://chatgpt.com/backend-api/me", { method: "GET" });
    await context.fetch("https://accounts.google.com/o/oauth2/v2/auth", { method: "POST" });
    context.open("https://accounts.google.com/signin", "login");
    context.history.pushState({}, "", "https://chatgpt.com/c/abc");
    context.history.replaceState({}, "", "https://accounts.google.com/x");
    context.localStorage.setItem("k", "value");
    context.indexedDB.open("db", 1);

    const fetchCalls = calls.filter(x => x[0] === "fetch");
    assert(fetchCalls.some(x => x[1] === "/backend-api/me"), "target-origin fetch must become local path", { calls });
    assert(fetchCalls.some(x => String(x[1]).startsWith("/proxy?u=")), "auth-origin fetch must go through proxy", { calls });
    assert(opened.some(x => String(x.url).startsWith("/proxy?u=")), "auth popup must open as local proxy popup", { opened });
    assert(calls.some(x => x[0] === "pushState" && x[3] === "/c/abc"), "history pushState must localize target URLs", { calls });
    assert(calls.some(x => x[0] === "replaceState" && String(x[3]).startsWith("/proxy?u=")), "history replaceState must proxy auth URLs", { calls });
    assert(loginButton.clicked === 1, "auto-login must click the login button once", { clicked: loginButton.clicked });
    assert(beacons.length > 0, "state hooks must report via beacon", { beacons: beacons.length });
    return { fetchCalls: fetchCalls.length, opened: opened.length, beacons: beacons.length };
  });
}

function makeStorage() {
  const map = new Map();
  return { getItem: key => map.get(key) || null, setItem: (key, value) => map.set(key, String(value)), removeItem: key => map.delete(key), clear: () => map.clear() };
}

function makeElement(tag, text) {
  return {
    tagName: tag.toUpperCase(),
    textContent: text,
    clicked: 0,
    value: "",
    getAttribute: () => "",
    getBoundingClientRect: () => ({ width: 100, height: 30 }),
    closest: () => null,
    click() { this.clicked++; },
    focus() {},
    dispatchEvent() {}
  };
}

function makeXHR(calls) {
  function XHR() { this.listeners = {}; this.status = 200; }
  XHR.prototype.open = function(method, url) { calls.push(["xhr.open", method, url]); this.url = url; };
  XHR.prototype.send = function(body) { calls.push(["xhr.send", this.url, body]); this.listeners.loadend?.(); };
  XHR.prototype.addEventListener = function(name, fn) { this.listeners[name] = fn; };
  XHR.prototype.getResponseHeader = () => "text/plain";
  return XHR;
}

module.exports = { run };
