// B"H
/**
 * @file networkPanel.js
 * @description Network panel for Merkava DevTools.
 *
 * Records ALL network requests made through the wrapped fetch: method, URL,
 * headers, body (bounded), timing, status, response size. Supports:
 *  - list/filter requests
 *  - replay any request
 *  - block URL patterns
 *  - artificial latency (throttle)
 *
 * Purely additive: wraps globalThis.fetch (and restores it on detach).
 * Also usable as a host-API fetch for VM page scripts.
 */

const MAX_BODY_LOG = 4096;

function summarizeBody(body) {
  if (body === undefined || body === null) return null;
  if (typeof body === "string") {
    return body.length > MAX_BODY_LOG ? body.slice(0, MAX_BODY_LOG) + `…(${body.length})` : body;
  }
  if (body instanceof Uint8Array) return `[binary ${body.length} bytes]`;
  try { return `[${typeof body}]`; } catch { return "[body]"; }
}

function headersToObject(headers) {
  const out = {};
  try {
    if (!headers) return out;
    if (typeof headers.forEach === "function") headers.forEach((v, k) => { out[k] = v; });
    else if (typeof headers === "object") Object.assign(out, headers);
  } catch { /* ignore */ }
  return out;
}

export class NetworkRecorder {
  constructor() {
    this.requests = [];
    this.blocked = [];      // RegExp strings
    this.throttleMs = 0;
    this.originalFetch = null;
    this.attached = false;
    this.nextId = 1;
  }

  attach() {
    if (this.attached) return this;
    const rec = this;
    const original = globalThis.fetch;
    if (typeof original !== "function") throw new Error("[networkPanel] globalThis.fetch not available");
    this.originalFetch = original;
    globalThis.fetch = async function (input, init = {}) {
      const url = typeof input === "string" ? input : (input && input.url) || String(input);
      const method = String((init && init.method) || (input && input.method) || "GET").toUpperCase();
      if (rec.isBlocked(url)) {
        const err = new Error(`[networkPanel] blocked: ${url}`);
        err.code = "MERKAVA_BLOCKED";
        rec._record({ method, url, blocked: true, error: err.message });
        throw err;
      }
      if (rec.throttleMs > 0) await new Promise((r) => setTimeout(r, rec.throttleMs));
      const id = rec.nextId++;
      const startedAt = Date.now();
      const entry = {
        id, method, url,
        requestHeaders: headersToObject(init.headers),
        requestBody: summarizeBody(init.body),
        startedAt, status: null, statusText: null,
        responseHeaders: {}, responseSize: 0, durationMs: null,
        ok: false, error: null, blocked: false
      };
      rec.requests.push(entry);
      try {
        const res = await original(input, init);
        entry.status = res.status;
        entry.statusText = res.statusText;
        entry.ok = res.ok;
        entry.responseHeaders = headersToObject(res.headers);
        // Peek at body size without consuming caller's stream: clone it.
        try {
          const clone = res.clone();
          const buf = await clone.arrayBuffer();
          entry.responseSize = buf.byteLength;
        } catch { entry.responseSize = -1; }
        entry.durationMs = Date.now() - startedAt;
        return res;
      } catch (e) {
        entry.error = String((e && e.message) || e);
        entry.durationMs = Date.now() - startedAt;
        throw e;
      }
    };
    this.attached = true;
    return this;
  }

  detach() {
    if (this.attached && this.originalFetch) {
      globalThis.fetch = this.originalFetch;
      this.attached = false;
      this.originalFetch = null;
    }
    return this;
  }

  isBlocked(url) {
    return this.blocked.some((p) => { try { return new RegExp(p).test(url); } catch { return false; } });
  }

  block(pattern) { this.blocked.push(String(pattern)); return this.blocked.length; }
  unblockAll() { this.blocked = []; return this; }
  setThrottle(ms) { this.throttleMs = Math.max(0, Number(ms) || 0); return this.throttleMs; }

  _record(partial) {
    const entry = { id: this.nextId++, startedAt: Date.now(), ...partial };
    this.requests.push(entry);
    return entry;
  }

  list(filter = {}) {
    let out = this.requests;
    if (filter.method) out = out.filter((r) => r.method === String(filter.method).toUpperCase());
    if (filter.url) { const re = new RegExp(String(filter.url)); out = out.filter((r) => re.test(r.url)); }
    if (filter.status) out = out.filter((r) => r.status === Number(filter.status));
    if (filter.failed) out = out.filter((r) => r.error || r.blocked);
    return out.map((r) => ({ ...r }));
  }

  get(id) { return this.requests.find((r) => r.id === Number(id)) || null; }

  /** Replay a recorded request through the (possibly wrapped) fetch. */
  async replay(id, overrides = {}) {
    const orig = this.get(id);
    if (!orig) throw new Error(`[networkPanel] no request #${id}`);
    const fetchFn = this.attached ? globalThis.fetch : this.originalFetch;
    if (typeof fetchFn !== "function") throw new Error("[networkPanel] no fetch available for replay");
    const res = await fetchFn(orig.url, {
      method: overrides.method || orig.method,
      headers: overrides.headers || orig.requestHeaders
    });
    return { status: res.status, ok: res.ok, url: orig.url, method: overrides.method || orig.method };
  }

  stats() {
    const total = this.requests.length;
    const failed = this.requests.filter((r) => r.error || r.blocked).length;
    const bytes = this.requests.reduce((s, r) => s + Math.max(0, r.responseSize || 0), 0);
    const durs = this.requests.map((r) => r.durationMs || 0).filter((d) => d > 0);
    return {
      total, failed, blocked: this.requests.filter((r) => r.blocked).length,
      totalResponseBytes: bytes,
      avgDurationMs: durs.length ? +(durs.reduce((a, b) => a + b, 0) / durs.length).toFixed(1) : 0,
      throttleMs: this.throttleMs
    };
  }

  clear() { this.requests = []; return this; }
}
