//B"H

/**
 * Chapter 22: The Invisible Nerve Bent Fetch Back Home.
 *
 * The DOM stays untouched for React hydration. JavaScript assets receive this
 * small preamble so absolute ChatGPT fetch/XHR calls return to the local Node
 * proxy. The browser console receives only important relay events: POSTs, API
 * paths, auth paths, Cloudflare paths, failures, and rewritten cross-origin
 * requests. No request or response bodies are logged.
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
    const localize = value => {
      try {
        const raw = value && value.url ? value.url : value;
        const url = new URL(raw, location.href);
        if (url.origin === origin) return url.pathname + url.search + url.hash;
      } catch {}
      return value;
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
      const next = localize(input);
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
    const open = globalThis.XMLHttpRequest && XMLHttpRequest.prototype.open;
    const send = globalThis.XMLHttpRequest && XMLHttpRequest.prototype.send;
    if (open && send) {
      XMLHttpRequest.prototype.open = function(method, url) {
        const next = localize(url);
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
  })();\n`;
}

module.exports = { jsPreamble };
