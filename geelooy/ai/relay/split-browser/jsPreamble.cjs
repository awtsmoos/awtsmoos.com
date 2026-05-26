//B"H

/**
 * Chapter 22: The Invisible Nerve Bent Fetch Back Home.
 *
 * The DOM stays mostly untouched for hydration. JavaScript assets receive this
 * preamble so absolute upstream fetch/XHR/navigation calls return to the local
 * Node proxy. It also emits small browser-state breadcrumbs for URL changes,
 * localStorage/sessionStorage mutations, and IndexedDB open/delete calls.
 * Values are summarized on the client; bodies and secrets are not logged.
 *
 * @param {string} origin Upstream origin.
 * @returns {string} JavaScript preamble.
 */
function jsPreamble(origin) {
  return `;(() => {
    const key = "__AWTSMOOS_SPLIT_FETCH_PATCHED__";
    if (globalThis[key]) return;
    globalThis[key] = true;
    const origin = ${JSON.stringify(origin)};
    const clientLog = (stage, facts) => {
      try {
        const url = String(facts.url || facts.next || '');
        const important = facts.rewritten || facts.error || (facts.status && facts.status >= 400) || facts.method !== 'GET' || /\\/(backend|backend-anon|api|auth|ces|cdn-cgi)\\b/.test(url) || /[?&]_data=/.test(url);
        if (important) console.info('B"H split client', stage, facts);
      } catch {}
    };
    const reportState = (type, facts = {}) => {
      try {
        const payload = JSON.stringify({ type, href: location.href, ...facts });
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          if (navigator.sendBeacon('/client-state', blob)) return;
        }
        fetch('/client-state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
      } catch {}
    };
    const toLocal = value => {
      try {
        const raw = value && value.url ? value.url : value;
        const url = new URL(raw, location.href);
        if (url.origin === location.origin) return url.pathname + url.search + url.hash;
        if (url.origin === origin) return url.pathname + url.search + url.hash;
        return '/proxy?u=' + encodeURIComponent(url.href);
      } catch { return value; }
    };
    const requestInit = request => ({
      method: request.method,
      headers: request.headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.clone().body,
      credentials: 'same-origin',
      cache: request.cache,
      redirect: request.redirect,
      referrerPolicy: request.referrerPolicy,
      integrity: request.integrity,
      keepalive: request.keepalive,
      signal: request.signal,
      duplex: 'half'
    });
    const nativeFetch = globalThis.fetch && globalThis.fetch.bind(globalThis);
    if (nativeFetch) globalThis.fetch = async (input, init) => {
      const method = (init && init.method) || (input && input.method) || 'GET';
      const originalUrl = input && input.url ? input.url : input;
      const next = localizeForFetch(input);
      const rewritten = next !== input;
      clientLog('fetch:start', { method, url: String(originalUrl || ''), next: String(next || ''), rewritten });
      try {
        const response = rewritten && input instanceof Request
          ? await nativeFetch(next, { ...requestInit(input), ...(init || {}) })
          : await nativeFetch(next, init);
        clientLog('fetch:done', { method, url: String(originalUrl || ''), next: String(next || ''), rewritten, status: response.status, type: response.headers.get('content-type') || '' });
        return response;
      } catch (error) {
        clientLog('fetch:error', { method, url: String(originalUrl || ''), next: String(next || ''), rewritten, error: error && error.message || String(error) });
        throw error;
      }
    };
    function localizeForFetch(input) {
      if (input instanceof Request) {
        const next = toLocal(input.url);
        return next === input.url ? input : next;
      }
      return toLocal(input);
    }
    const open = globalThis.XMLHttpRequest && XMLHttpRequest.prototype.open;
    const send = globalThis.XMLHttpRequest && XMLHttpRequest.prototype.send;
    if (open && send) {
      XMLHttpRequest.prototype.open = function(method, url) {
        const next = toLocal(url);
        this.__awtsmoosSplit = { method, url: String(url || ''), next: String(next || ''), rewritten: next !== url };
        arguments[1] = next;
        return open.apply(this, arguments);
      };
      XMLHttpRequest.prototype.send = function(body) {
        const meta = this.__awtsmoosSplit || {};
        clientLog('xhr:start', { ...meta, bodyBytes: body && (body.byteLength || body.length) || 0 });
        this.addEventListener('loadend', () => clientLog('xhr:done', { ...meta, status: this.status, type: this.getResponseHeader('content-type') || '' }));
        this.addEventListener('error', () => clientLog('xhr:error', meta));
        return send.apply(this, arguments);
      };
    }
    const nativePush = history.pushState.bind(history);
    const nativeReplace = history.replaceState.bind(history);
    history.pushState = function(state, title, url) { const next = url == null ? url : toLocal(url); reportState('history.pushState', { url: String(next || '') }); return nativePush(state, title, next); };
    history.replaceState = function(state, title, url) { const next = url == null ? url : toLocal(url); reportState('history.replaceState', { url: String(next || '') }); return nativeReplace(state, title, next); };
    addEventListener('popstate', () => reportState('history.popstate', { url: location.href }));
    patchStorage('localStorage', globalThis.localStorage);
    patchStorage('sessionStorage', globalThis.sessionStorage);
    function patchStorage(name, storage) {
      if (!storage) return;
      const proto = Object.getPrototypeOf(storage);
      for (const method of ['setItem','removeItem','clear']) {
        const native = proto && proto[method];
        if (typeof native !== 'function') continue;
        proto[method] = function(k, v) {
          reportState(name + '.' + method, { key: String(k || ''), valueBytes: v == null ? 0 : String(v).length });
          return native.apply(this, arguments);
        };
      }
    }
    if (globalThis.indexedDB) {
      const nativeOpenDb = indexedDB.open?.bind(indexedDB);
      const nativeDeleteDb = indexedDB.deleteDatabase?.bind(indexedDB);
      if (nativeOpenDb) indexedDB.open = function(name, version) { reportState('indexedDB.open', { name: String(name || ''), version: version || null }); return nativeOpenDb.apply(indexedDB, arguments); };
      if (nativeDeleteDb) indexedDB.deleteDatabase = function(name) { reportState('indexedDB.deleteDatabase', { name: String(name || '') }); return nativeDeleteDb.apply(indexedDB, arguments); };
    }
    reportState('shim.ready', { origin });
  })();\n`;
}

module.exports = { jsPreamble };
