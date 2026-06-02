// B"H
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.Merkava = root.Merkava || {}; root.Merkava.VirtualWorker = factory().VirtualWorker; }
})(typeof self !== 'undefined' ? self : this, function() {
  /**
   * B"H
   * A local in-process worker: not a thread, but a faithful message vessel.
   * It supports postMessage, message/error listeners, onmessage, terminate,
   * importScripts from provided files, and deterministic async delivery.
   */
  class VirtualWorker {
    constructor(scriptURL = '', options = {}, host = {}) {
      this.scriptURL = String(scriptURL || '');
      this.options = options || {};
      this.host = host || {};
      this.listeners = { message: [], error: [], messageerror: [] };
      this.onmessage = null;
      this.onerror = null;
      this.terminated = false;
      this.scope = this.createScope();
      this.loadScript(this.scriptURL);
    }

    postMessage(data) {
      if (this.terminated) return;
      queueMicrotaskSafe(() => this.scope.__dispatchFromHost(data));
    }

    terminate() { this.terminated = true; }
    addEventListener(type, fn) { if (fn) (this.listeners[type] = this.listeners[type] || []).push(fn); }
    removeEventListener(type, fn) { this.listeners[type] = (this.listeners[type] || []).filter(x => x !== fn); }
    dispatchEvent(event) { return dispatch(this, event); }

    createScope() {
      const worker = this;
      const scope = {
        self: null,
        globalThis: null,
        location: { href: this.scriptURL, toString() { return this.href; } },
        navigator: this.host.navigator || { userAgent: 'MerkavaWorker/1.0' },
        onmessage: null,
        onerror: null,
        close() { worker.terminate(); },
        postMessage(data) { if (!worker.terminated) queueMicrotaskSafe(() => worker.__dispatchToHost(data)); },
        addEventListener(type, fn) { if (fn) (scope.__listeners[type] = scope.__listeners[type] || []).push(fn); },
        removeEventListener(type, fn) { scope.__listeners[type] = (scope.__listeners[type] || []).filter(x => x !== fn); },
        dispatchEvent(event) { return dispatch(scope, event); },
        importScripts(...urls) { for (const url of urls) worker.evaluateScript(worker.resolveScript(url), String(url)); },
        setTimeout: this.host.setTimeout || setTimeout,
        clearTimeout: this.host.clearTimeout || clearTimeout,
        setInterval: this.host.setInterval || setInterval,
        clearInterval: this.host.clearInterval || clearInterval,
        console: this.host.console || console,
        fetch: this.host.fetch || fetch,
        OffscreenCanvas: this.host.OffscreenCanvas,
        ImageData: this.host.ImageData,
        Path2D: this.host.Path2D,
        Blob: this.host.Blob || Blob,
        URL: this.host.URL || URL,
        __listeners: { message: [], error: [], messageerror: [] },
        __dispatchFromHost(data) { dispatch(scope, { type: 'message', data, target: scope, currentTarget: scope }); }
      };
      scope.self = scope;
      scope.globalThis = scope;
      return scope;
    }

    loadScript(url) {
      const code = this.resolveScript(url);
      if (code) this.evaluateScript(code, url);
    }

    resolveScript(url) {
      const key = String(url || '').replace(/^\.\//, '');
      const files = this.host.files || {};
      return files[key] || files['/' + key] || files[this.scriptURL] || '';
    }

    evaluateScript(code, label = this.scriptURL) {
      try {
        const keys = Object.keys(this.scope);
        const values = keys.map(k => this.scope[k]);
        const fn = new Function(...keys, String(code || '') + `\n//# sourceURL=${label || 'virtual-worker.js'}`);
        fn(...values);
      } catch (error) {
        const event = { type: 'error', message: error.message, error, filename: label, target: this.scope, currentTarget: this.scope };
        dispatch(this.scope, event);
        this.__dispatchError(error, label);
      }
    }

    __dispatchToHost(data) { dispatch(this, { type: 'message', data, target: this, currentTarget: this }); }
    __dispatchError(error, filename) { dispatch(this, { type: 'error', message: error.message, error, filename, target: this, currentTarget: this }); }
  }

  function dispatch(target, event) {
    const list = (target.listeners || target.__listeners || {})[event.type] || [];
    const handler = target['on' + event.type];
    if (typeof handler === 'function') handler.call(target, event);
    for (const fn of list.slice()) fn.call(target, event);
    return true;
  }

  function queueMicrotaskSafe(fn) {
    if (typeof queueMicrotask === 'function') queueMicrotask(fn);
    else Promise.resolve().then(fn);
  }

  return { VirtualWorker };
});
