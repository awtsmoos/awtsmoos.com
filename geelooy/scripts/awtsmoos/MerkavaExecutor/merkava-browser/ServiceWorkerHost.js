// B"H
// Boruch Hashem
/**
 * @module ServiceWorkerHost
 * @description Full service worker runtime for the Merkava browser.
 *
 * Guest SW scripts run through the real Merkava pipeline
 * (MerkavaASTParser -> JSON IR -> bytecode -> Merkava VM) via VmScriptRunner —
 * V8 never executes guest code directly.
 *
 * Supported: register(), install / activate lifecycle with waitUntil,
 * fetch interception with respondWith, push, sync, message events, and a
 * named CacheStorage (caches.open/match/delete/keys + cache.put/add/addAll/
 * match/delete/keys) that persists to disk.
 *
 * Offline-first: pair with OfflinePageCache or let the SW populate its own
 * caches during install; handleFetch() serves SW responses with zero
 * network when the worker cached them.
 */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.Merkava = root.Merkava || {}; root.Merkava.ServiceWorkerHost = factory().ServiceWorkerHost; }
})(typeof self !== 'undefined' ? self : this, function() {
  function nodeRequire(name) {
    try { if (typeof require === 'function') return require(name); } catch (e) {}
    return null;
  }

  const VmRunner = nodeRequire('./VmScriptRunner.js');
  const runVmScript = VmRunner ? VmRunner.VmScriptRunner.runVmScript : null;
  const createListenerRegistry = VmRunner ? VmRunner.VmScriptRunner.createListenerRegistry : null;
  const dispatchListeners = VmRunner ? VmRunner.VmScriptRunner.dispatchListeners : null;

  function toBuffer(data) {
    if (!data) return Buffer.alloc(0);
    if (Buffer.isBuffer(data)) return data;
    if (data instanceof ArrayBuffer) return Buffer.from(data);
    if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    return Buffer.from(String(data), 'utf8');
  }

  /* ---------------------------------------------------------------- */
  /* Disk-backed named CacheStorage for service workers.               */
  /* ---------------------------------------------------------------- */

  class SWCache {
    constructor(name) { this.name = name; this.entries = new Map(); }
    _key(req) { return typeof req === 'string' ? req : (req && req.url) || String(req); }
    _normRes(res) {
      const rawBody = res && res.body !== undefined ? res.body : (res && res._body !== undefined ? res._body : undefined);
      const body = rawBody !== undefined ? rawBody : (typeof res === 'string' ? res : '');
      return {
        status: (res && res.status) || 200,
        statusText: (res && res.statusText) || '',
        headers: (res && res.headers) || {},
        url: (res && res.url) || '',
        body: toBuffer(body)
      };
    }
    async put(request, response) {
      const method = (request && request.method) || 'GET';
      if (String(method).toUpperCase() !== 'GET') throw new Error('TypeError: only GET requests are cacheable');
      this.entries.set(this._key(request), this._normRes(response));
    }
    async add(url) {
      const res = await this._fetch(String(url));
      const body = toBuffer(await res.arrayBuffer());
      await this.put(url, { status: res.status, headers: {}, url: String(url), body });
    }
    async addAll(urls) { for (const u of urls) await this.add(u); }
    async match(request) {
      const hit = this.entries.get(this._key(request));
      if (!hit) return undefined;
      return { status: hit.status, statusText: hit.statusText, headers: Object.assign({}, hit.headers), url: hit.url,
        body: hit.body,
        text: async () => hit.body.toString('utf8'),
        json: async () => JSON.parse(hit.body.toString('utf8')),
        arrayBuffer: async () => hit.body.buffer.slice(hit.body.byteOffset, hit.body.byteOffset + hit.body.byteLength),
        clone: () => Object.assign({}, hit) };
    }
    async delete(request) { return this.entries.delete(this._key(request)); }
    async keys() { return [...this.entries.keys()].map(url => ({ url, method: 'GET' })); }
  }

  class SWCacheStorage {
    constructor(options = {}) {
      this.caches = new Map();
      this.dir = options.cacheDir || null;
      this._fetch = options.fetchImpl || null;
    }
    async open(name) {
      name = String(name);
      let c = this.caches.get(name);
      if (!c) { c = new SWCache(name); c._fetch = this._fetch; this.caches.set(name, c); }
      return c;
    }
    async has(name) { return this.caches.has(String(name)); }
    async delete(name) { return this.caches.delete(String(name)); }
    async keys() { return [...this.caches.keys()]; }
    async match(request) {
      for (const c of this.caches.values()) { const m = await c.match(request); if (m) return m; }
      return undefined;
    }
    async persist() {
      const fs = nodeRequire('fs'), path = nodeRequire('path');
      if (!this.dir || !fs) return false;
      try {
        fs.mkdirSync(this.dir, { recursive: true });
        const manifest = { caches: {} };
        for (const [name, cache] of this.caches) {
          manifest.caches[name] = [];
          for (const [url, e] of cache.entries) {
            const f = 'sw-' + name.replace(/[^a-z0-9]/gi, '_') + '-' + Buffer.from(url).toString('hex').slice(0, 32);
            fs.writeFileSync(path.join(this.dir, f), e.body);
            manifest.caches[name].push({ url, file: f, status: e.status, headers: e.headers });
          }
        }
        fs.writeFileSync(path.join(this.dir, 'sw-caches.json'), JSON.stringify(manifest));
        return true;
      } catch (err) { return false; }
    }
    async load() {
      const fs = nodeRequire('fs'), path = nodeRequire('path');
      if (!this.dir || !fs) return false;
      try {
        const mp = path.join(this.dir, 'sw-caches.json');
        if (!fs.existsSync(mp)) return false;
        const manifest = JSON.parse(fs.readFileSync(mp, 'utf8'));
        for (const [name, entries] of Object.entries(manifest.caches || {})) {
          const cache = await this.open(name);
          for (const e of entries) {
            try {
              const body = fs.readFileSync(path.join(this.dir, e.file));
              cache.entries.set(e.url, { status: e.status, headers: e.headers || {}, url: e.url, body });
            } catch (err) {}
          }
        }
        return true;
      } catch (err) { return false; }
    }
  }

  /* ---------------------------------------------------------------- */
  /* Service worker registration.                                      */
  /* ---------------------------------------------------------------- */

  class ServiceWorkerRegistration {
    constructor(host, scope, scriptUrl) {
      this._host = host;
      this.scope = scope;
      this.scriptUrl = scriptUrl;
      this.active = null;
      this.installing = null;
      this.waiting = null;
    }
    async update() { return this._host._runLifecycle(this, true); }
    async unregister() { return this._host._unregister(this.scope); }
    async push(data) { return this._host.dispatchPush(this.scope, data); }
    async sync(tag) { return this._host.dispatchSync(this.scope, tag); }
  }

  class ServiceWorkerHost {
    constructor(options = {}) {
      this.options = options;
      this.fetchImpl = options.fetchImpl || (typeof fetch === 'function' ? fetch : null);
      this.cacheStorage = new SWCacheStorage({ cacheDir: options.cacheDir || null, fetchImpl: this.fetchImpl });
      this.registrations = new Map(); // scope -> { registration, listeners, vmHandle }
      this._clientId = 0;
    }

    _scopeFor(scriptUrl, scope) {
      if (scope) return String(scope);
      try {
        const u = new URL(String(scriptUrl), 'https://localhost/');
        const p = u.pathname;
        return u.origin + p.slice(0, p.lastIndexOf('/') + 1);
      } catch (e) { return '/'; }
    }

    _makeEvent(type, extra = {}) {
      const waiters = [];
      const ev = Object.assign({
        type,
        waitUntil(p) { waiters.push(Promise.resolve(p)); },
        _waiters: waiters
      }, extra);
      return ev;
    }

    async _awaitWaiters(ev, ms = 2000) {
      if (!ev._waiters.length) return;
      await Promise.race([
        Promise.all(ev._waiters.map(p => p.catch(() => {}))),
        new Promise(r => setTimeout(r, ms))
      ]);
    }

    _buildScopeGlobals(scope, registration) {
      const host = this;
      const { self, listeners } = createListenerRegistry();
      const clients = {
        _list: [],
        async matchAll() { return clients._list.slice(); },
        async get(id) { return clients._list.find(c => c.id === id) || null; },
        async openWindow(url) { const c = { id: 'client-' + (++host._clientId), url: String(url), type: 'window' }; clients._list.push(c); return c; },
        claim() { return Promise.resolve(); }
      };
      self.registration = registration;
      self.clients = clients;
      self.caches = host.cacheStorage;
      self.console = console;
      self.setTimeout = setTimeout; self.clearTimeout = clearTimeout;
      self.setInterval = setInterval; self.clearInterval = clearInterval;
      try { self.URL = URL; } catch (e) {}
      self.Request = function(input, init = {}) {
        this.url = typeof input === 'string' ? input : (input && input.url) || String(input);
        this.method = (init.method || (input && input.method) || 'GET').toUpperCase();
        this.headers = init.headers || {};
        this.mode = init.mode || 'cors';
      };
      self.Response = function(body, init = {}) {
        this._body = body === undefined ? '' : body;
        this.status = init.status !== undefined ? init.status : 200;
        this.statusText = init.statusText || '';
        this.headers = init.headers || {};
        this.ok = this.status >= 200 && this.status < 300;
        this.url = init.url || '';
        this.text = async () => typeof this._body === 'string' ? this._body : toBuffer(this._body).toString('utf8');
        this.json = async () => JSON.parse(await this.text());
        this.arrayBuffer = async () => { const b = toBuffer(this._body); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); };
        this.clone = () => new self.Response(this._body, { status: this.status, statusText: this.statusText, headers: this.headers, url: this.url });
      };
      self.fetch = (...args) => {
        if (!host.fetchImpl) return Promise.reject(new Error('no fetch implementation'));
        return host.fetchImpl(...args);
      };
      self.skipWaiting = () => Promise.resolve();
      // Bare-word globals: SW scripts use `caches`, `clients`, `fetch`,
      // `Response`, `Request` without the `self.` prefix.
      const topGlobals = {
        caches: host.cacheStorage,
        clients,
        fetch: self.fetch,
        Response: self.Response,
        Request: self.Request,
        URL: self.URL,
        console: self.console,
        setTimeout: self.setTimeout, clearTimeout: self.clearTimeout,
        setInterval: self.setInterval, clearInterval: self.clearInterval,
        skipWaiting: self.skipWaiting,
        registration
      };
      return { self, listeners, clients, topGlobals };
    }

    /**
     * Register a service worker. scriptSource is the worker's JS source.
     * Runs install -> activate lifecycle through the Merkava VM.
     */
    async register(scriptUrl, options = {}) {
      if (!runVmScript) throw new Error('VmScriptRunner unavailable');
      const scope = this._scopeFor(scriptUrl, options.scope);
      const scriptSource = options.scriptSource || '';
      if (!scriptSource) throw new Error('ServiceWorkerHost.register needs options.scriptSource');
      const registration = new ServiceWorkerRegistration(this, scope, String(scriptUrl));
      const { self, listeners, clients, topGlobals } = this._buildScopeGlobals(scope, registration);
      registration.installing = { scriptUrl: String(scriptUrl), state: 'installing' };
      const handle = await runVmScript(scriptSource, {
        label: String(scriptUrl),
        globals: Object.assign({ self }, topGlobals),
        cycles: options.cycles || 80000
      });
      if (handle.status === 'CRASHED') {
        throw new Error('Service worker script crashed: ' + handle.error);
      }
      this.registrations.set(scope, { registration, listeners, clients, vm: handle.vm, self });
      await this._runLifecycle(registration, false);
      return registration;
    }

    async _runLifecycle(registration, isUpdate) {
      const rec = this.registrations.get(registration.scope);
      if (!rec) return registration;
      // install
      const installEv = this._makeEvent('install');
      dispatchListeners(rec.listeners, 'install', installEv);
      await this._awaitWaiters(installEv);
      registration.installing = null;
      // activate
      const activateEv = this._makeEvent('activate');
      dispatchListeners(rec.listeners, 'activate', activateEv);
      await this._awaitWaiters(activateEv);
      registration.active = { scriptUrl: registration.scriptUrl, state: 'activated' };
      return registration;
    }

    _findRegistration(url) {
      url = String(url);
      let best = null;
      for (const [scope, rec] of this.registrations) {
        if (url.startsWith(scope) && (!best || scope.length > best.scope.length)) best = rec;
      }
      if (!best && url.startsWith('/')) {
        // Root-relative URL: resolve against each registered scope's origin.
        for (const [scope, rec] of this.registrations) {
          let origin = '';
          try { origin = new URL(scope).origin; } catch (e) {}
          if (origin && (origin + url).startsWith(scope) && (!best || scope.length > best.scope.length)) best = rec;
        }
      }
      return best;
    }

    /**
     * Route a fetch through the matching service worker.
     * Returns a normalized response { status, headers, body: Buffer } or null
     * when no worker handled it (caller should use the network).
     */
    async handleFetch(request) {
      const url = typeof request === 'string' ? request : request.url;
      const rec = this._findRegistration(url);
      if (!rec) return null;
      const req = typeof request === 'string'
        ? { url, method: 'GET', headers: {} }
        : { url, method: (request.method || 'GET').toUpperCase(), headers: request.headers || {}, body: request.body };
      let responded = null;
      const fetchEv = this._makeEvent('fetch', {
        request: req,
        respondWith(res) { responded = res; },
        _responded() { return responded !== null && responded !== undefined; }
      });
      dispatchListeners(rec.listeners, 'fetch', fetchEv);
      // Let promise chains (e.g. caches.match().then(respondWith)) settle.
      for (let i = 0; i < 20 && !fetchEv._responded(); i++) {
        await new Promise(r => setTimeout(r, 25));
      }
      await this._awaitWaiters(fetchEv, 500);
      if (!fetchEv._responded()) return null;
      return this._normalizeResponse(responded, url);
    }

    async _normalizeResponse(res, url) {
      // Unwrap syncPromise vessels.
      if (res && res.__kind === 'syncPromise') res = res.value;
      if (res && typeof res.then === 'function') {
        try { res = await Promise.race([res, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 3000))]); }
        catch (e) { return { status: 500, headers: {}, body: Buffer.from('SW respondWith rejected: ' + e.message), url }; }
        if (res && res.__kind === 'syncPromise') res = res.value;
      }
      if (res && typeof res.arrayBuffer === 'function') {
        const body = toBuffer(await res.arrayBuffer());
        return { status: res.status || 200, headers: res.headers || {}, body, url: res.url || url };
      }
      if (Buffer.isBuffer(res)) return { status: 200, headers: {}, body: res, url };
      if (typeof res === 'string') return { status: 200, headers: {}, body: Buffer.from(res, 'utf8'), url };
      if (res && typeof res === 'object' && res.body !== undefined) {
        return { status: res.status || 200, headers: res.headers || {}, body: toBuffer(res.body), url: res.url || url };
      }
      return { status: 200, headers: {}, body: Buffer.from(String(res === undefined ? '' : res), 'utf8'), url };
    }

    async dispatchPush(scope, data) {
      const rec = this.registrations.get(scope);
      if (!rec) return { ok: false, reason: 'no-registration' };
      const ev = this._makeEvent('push', { data: { text: () => Promise.resolve(typeof data === 'string' ? data : JSON.stringify(data)), json: () => Promise.resolve(data) } });
      dispatchListeners(rec.listeners, 'push', ev);
      await this._awaitWaiters(ev);
      return { ok: true };
    }

    async dispatchSync(scope, tag) {
      const rec = this.registrations.get(scope);
      if (!rec) return { ok: false, reason: 'no-registration' };
      const ev = this._makeEvent('sync', { tag: String(tag), lastChance: false });
      dispatchListeners(rec.listeners, 'sync', ev);
      await this._awaitWaiters(ev);
      return { ok: true };
    }

    async dispatchMessage(scope, data) {
      const rec = this.registrations.get(scope);
      if (!rec) return { ok: false, reason: 'no-registration' };
      const ev = this._makeEvent('message', { data });
      dispatchListeners(rec.listeners, 'message', ev);
      await this._awaitWaiters(ev, 500);
      return { ok: true };
    }

    async _unregister(scope) {
      return this.registrations.delete(scope);
    }

    async persistCaches() { return this.cacheStorage.persist(); }
    async loadCaches() { return this.cacheStorage.load(); }
  }

  return { ServiceWorkerHost, ServiceWorkerRegistration, SWCacheStorage, SWCache };
});
