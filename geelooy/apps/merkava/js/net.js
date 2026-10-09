// B"H — Merkava browser networking layer.
//
// NetProvider interface (what page loads need):
//   fetchDocument(url) -> Promise<{
//     ok: boolean, status: number, url: string, finalUrl: string,
//     contentType: string, text: string
//   }>
//   fetchAsset(url) -> Promise<{
//     ok: boolean, status: number, url: string, finalUrl: string,
//     contentType: string, bytes: Uint8Array
//   }>
//
// On failure both methods REJECT with a NetError { code, message, url } —
// never a fake success. Codes: fetch_failed, http_error, timeout,
// tunnel_not_configured, tunnel_error.
//
// Providers:
//   FetchNetProvider        — the host fetch() (browser or Node 18+).
//                             Subject to the page's CORS policy (see
//                             NETWORKING.md for the honest boundary).
//   TunnelRelayNetProvider  — stub implementing the same interface over
//                             MerkavaTunnelClient. Requires configure() with
//                             a live tunnel client + the remote fetch relay
//                             action (see NETWORKING.md "tunnel seam").
//
// UMD: window.Merkava.Net in the page, module.exports in Node.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else { root.Merkava = root.Merkava || {}; root.Merkava.Net = factory(); }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  class NetError extends Error {
    constructor(code, message, url) {
      super(message);
      this.name = "NetError";
      this.code = code;
      this.url = url;
    }
  }

  const DEFAULT_TIMEOUT_MS = 30000;

  function pickFetch(explicit) {
    if (explicit) return explicit;
    if (typeof fetch !== "undefined") return fetch.bind(typeof globalThis !== "undefined" ? globalThis : undefined);
    return null;
  }

  /** Host fetch() provider. Honest errors, no CORS bypass claims. */
  class FetchNetProvider {
    constructor(opts = {}) {
      this.fetchImpl = pickFetch(opts.fetchImpl);
      if (!this.fetchImpl) throw new NetError("no_fetch", "FetchNetProvider: no fetch implementation available", "");
      this.timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
      this.name = "fetch";
    }

    async _get(url, timeoutMs) {
      const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
      const to = setTimeout(() => { try { ctrl && ctrl.abort(); } catch (_) {} }, timeoutMs || this.timeoutMs);
      try {
        return await this.fetchImpl(String(url), { signal: ctrl ? ctrl.signal : undefined, redirect: "follow" });
      } catch (e) {
        if (e && e.name === "AbortError") throw new NetError("timeout", "fetch timed out: " + url, String(url));
        // CORS failures, DNS failures, refused connections all land here as
        // TypeError in browsers — report honestly, do not guess the cause.
        throw new NetError("fetch_failed", "fetch failed: " + ((e && e.message) || e), String(url));
      } finally { clearTimeout(to); }
    }

    async fetchDocument(url, opts = {}) {
      const res = await this._get(url, opts.timeoutMs);
      if (!res.ok) throw new NetError("http_error", "HTTP " + res.status + " for " + url, String(url));
      const text = await res.text();
      return {
        ok: true, status: res.status, url: String(url), finalUrl: res.url || String(url),
        contentType: (res.headers.get("content-type") || "text/html").split(";")[0].trim(),
        text,
      };
    }

    async fetchAsset(url, opts = {}) {
      const res = await this._get(url, opts.timeoutMs);
      if (!res.ok) throw new NetError("http_error", "HTTP " + res.status + " for " + url, String(url));
      const ab = await res.arrayBuffer();
      return {
        ok: true, status: res.status, url: String(url), finalUrl: res.url || String(url),
        contentType: (res.headers.get("content-type") || "application/octet-stream").split(";")[0].trim(),
        bytes: new Uint8Array(ab),
      };
    }
  }

  /**
   * Tunnel-relay provider (stub). Same interface; every call without a
   * configured relay rejects with tunnel_not_configured — an honest,
   * greppable signal, never a silent fallback to host fetch.
   *
   * configure({ client, action }) wires it:
   *   client — a MerkavaTunnelClient instance (merkava-browser/
   *            MerkavaTunnelClient.js) with token + route.
   *   action — the tunnel action name the remote side implements for
   *            URL fetching, e.g. "fetchUrl". The remote side MUST exist;
   *            see NETWORKING.md for the exact request/response contract the
   *            tunnel has to expose.
   */
  class TunnelRelayNetProvider {
    constructor(opts = {}) {
      this.client = opts.client || null;
      this.action = opts.action || null;
      this.timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS;
      this.name = "tunnel-relay";
    }

    configure({ client, action }) {
      this.client = client || this.client;
      this.action = action || this.action;
      return this;
    }

    get configured() { return !!(this.client && this.action); }

    _needConfigured(url) {
      if (!this.configured) {
        throw new NetError(
          "tunnel_not_configured",
          "TunnelRelayNetProvider: no tunnel client/action configured — call configure({client, action}) (see NETWORKING.md)",
          String(url)
        );
      }
    }

    async _relay(url, wantBytes) {
      this._needConfigured(url);
      let resp;
      try {
        resp = await this.client.executeAction(this.action, {
          url: String(url),
          response: wantBytes ? "bytes" : "text",
          timeoutMs: this.timeoutMs,
        }, { timeoutMs: this.timeoutMs + 30000 });
      } catch (e) {
        throw new NetError("tunnel_error", "tunnel relay failed: " + ((e && e.message) || e), String(url));
      }
      if (!resp || resp.ok === false || resp.error) {
        throw new NetError("tunnel_error", "tunnel relay error: " + ((resp && (resp.error || resp.message)) || "unknown"), String(url));
      }
      return resp;
    }

    async fetchDocument(url, opts = {}) {
      const resp = await this._relay(url, false);
      return {
        ok: true, status: resp.status || 200, url: String(url), finalUrl: resp.finalUrl || String(url),
        contentType: resp.contentType || "text/html",
        text: typeof resp.text === "string" ? resp.text : String(resp.text || ""),
      };
    }

    async fetchAsset(url, opts = {}) {
      const resp = await this._relay(url, true);
      // Remote sends bytes as base64 (JSON-safe); decode locally.
      const b64 = resp.bytesBase64 || "";
      const bin = typeof atob === "function"
        ? Uint8Array.from(atob(b64), c => c.charCodeAt(0))
        : Uint8Array.from(Buffer.from(b64, "base64"));
      return {
        ok: true, status: resp.status || 200, url: String(url), finalUrl: resp.finalUrl || String(url),
        contentType: resp.contentType || "application/octet-stream",
        bytes: bin,
      };
    }
  }

  return { NetError, FetchNetProvider, TunnelRelayNetProvider, DEFAULT_TIMEOUT_MS };
});
