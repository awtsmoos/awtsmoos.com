// B"H
// Boruch Hashem
// Blessed is He
//
// SmartNet — unified network layer for the Merkava browser.
//
// Yaakov: "For web it can use the direct API to simulate real requests outside
// CORS or use the installed tunnel as a relay."
//
// Strategy: DIRECT first (fastest — raw Node http/https, zero CORS), tunnel
// relay as FALLBACK (when direct fails: restricted network, filtered egress,
// or the operator forces relay mode).
//
// Pipeline speed: runtime-provisioned keep-alive agents (connection reuse),
// transparent gzip/deflate/br (DirectNet), in-flight GET dedup, bounded
// parallel fetchAll, streaming onChunk hooks, and an opt-in HTTP response
// cache with max-age freshness + ETag revalidation (SmartNet).
//
// Also provides bindPageNet(window, opts): installs CORS-free fetch and
// XMLHttpRequest on the virtual window so page scripts get real network
// outside the browser sandbox — like a native app, not a web page.
//
// Design: small module, zero dependencies beyond siblings, injectable relay.

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.SmartNet = factory().SmartNet;
	}
})(typeof self !== "undefined" ? self : this, function() {

function tryRequire(name) {
	try { if (typeof require === "function") return require(name); } catch (e) {}
	return null;
}

function loadSiblings() {
	const dn = tryRequire("./DirectNet.js");
	const rn = tryRequire("./TunnelRelayNet.js");
	return {
		DirectNet: dn && (dn.DirectNet || dn),
		TunnelRelayNet: rn && (rn.TunnelRelayNet || rn)
	};
}

// B"H: in-flight GET dedup. Concurrent identical GETs (same method, URL,
// headers, mode) share ONE network request instead of stampeding the server.
// Response bodies are handed out as zero-copy views — consumers must treat
// them as read-only (toFetchResponse never mutates; XHR only reads).
const __inflight = new Map();
const netStats = { requests: 0, deduped: 0 };

function stableHeadersKey(headers) {
	const lowered = {};
	for (const k of Object.keys(headers || {})) lowered[String(k).toLowerCase()] = String(headers[k]);
	return Object.keys(lowered).sort().map(k => k + "=" + lowered[k]).join("\n");
}

function dedupKey(url, options, method) {
	return method + "\n" + String(url) + "\n" + (options.mode || "auto") + "\n" +
		stableHeadersKey(options.headers);
}

function shareBodyView(body) {
	if (typeof Buffer !== "undefined" && Buffer.isBuffer(body)) return body.subarray(0);
	if (typeof Uint8Array !== "undefined" && body instanceof Uint8Array) return body.subarray(0);
	if (body instanceof ArrayBuffer) return Buffer.from(body).subarray(0);
	return Buffer.from(String(body || ""), "utf8");
}

/* ================================================================== */
/* HTTP RESPONSE CACHE — max-age freshness + ETag revalidation         */
/* Bounded RAM: LRU eviction under maxBytes (default 32MB).            */
/* ================================================================== */

function parseCacheControl(headers) {
	const dirs = {};
	const cc = String((headers && headers["cache-control"]) || "");
	for (const part of cc.split(",")) {
		const eq = part.indexOf("=");
		if (eq < 0) dirs[part.trim().toLowerCase()] = true;
		else dirs[part.slice(0, eq).trim().toLowerCase()] = part.slice(eq + 1).trim().replace(/^"|"$/g, "");
	}
	return dirs;
}

class ResponseCache {
	constructor(options = {}) {
		this.maxBytes = options.maxBytes || 32 * 1024 * 1024;
		this.map = new Map(); // url -> entry (insertion order = LRU)
		this.bytes = 0;
		this.stats = { hits: 0, misses: 0, revalidated: 0, evictions: 0, stores: 0 };
	}

	__isFresh(entry, now) {
		if (entry.cc["no-store"] || entry.cc["no-cache"]) return false;
		if (entry.cc["max-age"] !== undefined) {
			const n = Number(entry.cc["max-age"]);
			if (Number.isFinite(n)) return (now - entry.storedAt) < n * 1000;
		}
		const exp = Date.parse(entry.headers["expires"] || "");
		if (Number.isFinite(exp)) return now < exp;
		return false;
	}

	__touch(key, entry) {
		this.map.delete(key);
		this.map.set(key, entry);
	}

	__evict() {
		while (this.bytes > this.maxBytes && this.map.size > 0) {
			const oldest = this.map.keys().next().value;
			const e = this.map.get(oldest);
			this.bytes -= e.size;
			this.map.delete(oldest);
			this.stats.evictions++;
		}
	}

	/** Fresh entry for url, or null. Refreshes LRU position. */
	getFresh(url) {
		const key = String(url);
		const e = this.map.get(key);
		if (!e) { this.stats.misses++; return null; }
		if (!this.__isFresh(e, Date.now())) { this.stats.misses++; return null; }
		this.__touch(key, e);
		this.stats.hits++;
		return e;
	}

	/** Stale-but-revalidatable entry (has ETag), or null. */
	getStale(url) {
		const key = String(url);
		const e = this.map.get(key);
		if (!e || !e.etag) return null;
		return e;
	}

	/** Store a GET 200 response. Bodies are kept by reference (no copy). */
	store(url, res) {
		if (!res || res.status !== 200) return false;
		const headers = res.headers || {};
		const cc = parseCacheControl(headers);
		if (cc["no-store"]) return false;
		const body = Buffer.isBuffer(res.body) ? res.body
			: Buffer.from(res.body instanceof Uint8Array ? res.body : String(res.body || ""));
		const key = String(url);
		const old = this.map.get(key);
		if (old) this.bytes -= old.size;
		const entry = {
			status: res.status,
			statusText: res.statusText || "",
			headers: { ...headers },
			body,
			size: body.length,
			storedAt: Date.now(),
			etag: headers["etag"] || null,
			cc
		};
		this.map.delete(key);
		this.map.set(key, entry);
		this.bytes += entry.size;
		this.stats.stores++;
		this.__evict();
		return true;
	}

	/**
	 * A 304 arrived for a revalidation: refresh storedAt/headers, serve the
	 * cached body. Returns a smartFetch-shaped response, or null.
	 */
	revalidated(url, newHeaders) {
		const key = String(url);
		const e = this.map.get(key);
		if (!e) return null;
		e.storedAt = Date.now();
		e.headers = { ...e.headers, ...newHeaders };
		e.cc = parseCacheControl(e.headers);
		e.etag = e.headers["etag"] || e.etag;
		this.__touch(key, e);
		this.stats.revalidated++;
		return {
			ok: e.status >= 200 && e.status < 300,
			status: e.status,
			statusText: e.statusText,
			headers: { ...e.headers },
			body: e.body.subarray(0),
			url: key,
			redirected: false,
			redirectCount: 0,
			route: "revalidated",
			fromCache: true
		};
	}

	/** Build a smartFetch-shaped response from a fresh cache entry. */
	cachedResponse(url, entry) {
		return {
			ok: entry.status >= 200 && entry.status < 300,
			status: entry.status,
			statusText: entry.statusText,
			headers: { ...entry.headers },
			body: entry.body.subarray(0),
			url: String(url),
			redirected: false,
			redirectCount: 0,
			route: "cache",
			fromCache: true
		};
	}

	clear() {
		this.map.clear();
		this.bytes = 0;
	}

	getStats() {
		return { ...this.stats, entries: this.map.size, bytes: this.bytes, maxBytes: this.maxBytes };
	}
}

function createResponseCache(options) {
	return new ResponseCache(options);
}

/**
 * Smart fetch: direct first, tunnel relay as fallback.
 *
 * Pipeline optimizations (all additive, zero behavior change for callers):
 * - In-flight dedup: concurrent identical GETs share one network request.
 * - Response cache (opt-in via options.responseCache): max-age freshness
 *   serves repeat visits with zero network; stale entries revalidate with
 *   If-None-Match so a 304 costs headers only, not the body.
 *
 * @param {string} url
 * @param {object} [options] { method, headers, body, timeoutMs, maxRedirects,
 *   mode: "auto"|"direct"|"relay", relayInvoke, onRoute, responseCache,
 *   onChunk(chunk) — streaming hook while downloading }
 * @returns {Promise<{ok,status,statusText,headers,body,url,route}>}
 *   route is "direct", "relay", "cache", or "revalidated".
 */
async function smartFetch(url, options = {}) {
	const { DirectNet, TunnelRelayNet } = loadSiblings();
	if (!DirectNet) throw new Error("SmartNet: DirectNet.js not available");
	const method = (options.method || "GET").toUpperCase();
	const responseCache = options.responseCache || null;
	const cacheable = !!(responseCache && method === "GET" && options.body == null);
	netStats.requests++;

	// Fast path: a fresh cache entry costs one Map lookup, zero network.
	if (cacheable) {
		const fresh = responseCache.getFresh(url);
		if (fresh) return responseCache.cachedResponse(url, fresh);
	}

	// One network flight per identical concurrent GET (thundering-herd guard).
	const key = dedupKey(url, options, method);
	const existing = __inflight.get(key);
	if (existing) {
		netStats.deduped++;
		return existing;
	}
	const p = networkFlight(url, options, { DirectNet, TunnelRelayNet }, responseCache, cacheable);
	__inflight.set(key, p);
	const cleanup = () => { if (__inflight.get(key) === p) __inflight.delete(key); };
	p.then(cleanup, cleanup);
	return p;
}

async function networkFlight(url, options, sibs, responseCache, cacheable) {
	const { DirectNet, TunnelRelayNet } = sibs;
	const mode = options.mode || "auto";
	const onRoute = typeof options.onRoute === "function" ? options.onRoute : null;
	const directOpts = {
		method: options.method,
		headers: options.headers,
		body: options.body,
		timeoutMs: options.timeoutMs,
		maxRedirects: options.maxRedirects,
		onChunk: options.onChunk
	};

	// Stale entry with an ETag: revalidate (If-None-Match) instead of a full
	// download — a 304 costs headers only.
	let stale = null;
	if (cacheable) {
		stale = responseCache.getStale(url);
		if (stale && stale.etag) {
			directOpts.headers = Object.assign({}, directOpts.headers || {}, {
				"if-none-match": stale.etag
			});
		}
	}

	async function viaRelay(reason) {
		if (!TunnelRelayNet) throw new Error("SmartNet: relay requested but TunnelRelayNet.js not available (" + reason + ")");
		if (typeof options.relayInvoke !== "function") {
			throw new Error("SmartNet: relay requested but no relayInvoke(action, payload) provided (" + reason + ")");
		}
		const relay = TunnelRelayNet.createTunnelRelay(options.relayInvoke);
		const res = await relay.relayFetch(url, directOpts);
		if (onRoute) { try { onRoute("relay", reason); } catch (e) {} }
		return { ...res, url: String(url), route: "relay" };
	}

	let res;
	if (mode === "relay") {
		res = await viaRelay("forced relay mode");
	} else {
		try {
			const d = await DirectNet.directFetch(url, directOpts);
			if (onRoute) { try { onRoute("direct", null); } catch (e) {} }
			res = { ...d, route: "direct" };
		} catch (directErr) {
			if (mode === "direct") throw directErr;
			res = await viaRelay("direct failed: " + (directErr && directErr.message));
		}
	}

	if (cacheable) {
		if (res.status === 304 && stale) return responseCache.revalidated(url, res.headers);
		responseCache.store(url, res);
	}
	return res;
}

/**
 * Fetch many URLs in parallel with a bounded concurrency cap (default 6,
 * browser-style). Results come back in input order. With settleAll, each
 * slot reports {ok, value|error} instead of rejecting the batch.
 * Shares the keep-alive pool, the in-flight dedup, and the response cache.
 */
async function smartFetchAll(urls, options = {}) {
	const list = Array.isArray(urls) ? urls : [urls];
	const maxConcurrency = Math.max(1, Number(options.maxConcurrency) || 6);
	const settleAll = !!options.settleAll;
	const results = new Array(list.length);
	let next = 0;
	async function worker() {
		while (true) {
			const i = next++;
			if (i >= list.length) return;
			try {
				results[i] = { ok: true, value: await smartFetch(list[i], options) };
			} catch (error) {
				if (!settleAll) throw error;
				results[i] = { ok: false, error };
			}
		}
	}
	const workers = [];
	for (let w = 0; w < Math.min(maxConcurrency, list.length); w++) workers.push(worker());
	await Promise.all(workers);
	if (settleAll) return results;
	return results.map(r => r.value);
}

function getNetStats() {
	return { ...netStats };
}

/**
 * Minimal Response-compatible wrapper around a SmartNet result, so page
 * scripts can use familiar fetch semantics: res.text(), res.json(), etc.
 */
function toFetchResponse(smartRes) {
	const body = smartRes.body;
	const buf = typeof Buffer !== "undefined" && Buffer.isBuffer(body)
		? body
		: Buffer.from(body instanceof Uint8Array ? body : String(body || ""));
	let consumed = false;
	function take() {
		if (consumed) throw new Error("TypeError: body already consumed");
		consumed = true;
		return buf;
	}
	return {
		ok: !!smartRes.ok,
		status: smartRes.status || 0,
		statusText: smartRes.statusText || "",
		url: smartRes.url || "",
		redirected: !!smartRes.redirected,
		headers: {
			get(name) {
				const h = smartRes.headers || {};
				const v = h[String(name).toLowerCase()];
				return v == null ? null : String(v);
			},
			has(name) { return this.get(name) != null; }
		},
		async arrayBuffer() { const b = take(); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); },
		async text() { return take().toString("utf8"); },
		async json() { return JSON.parse(take().toString("utf8")); },
		clone() { return toFetchResponse({ ...smartRes, body: Buffer.from(buf) }); }
	};
}

/**
 * Install CORS-free fetch + XMLHttpRequest on a virtual window object.
 * Page scripts calling fetch()/new XMLHttpRequest() get native-app network:
 * no preflight, no Origin enforcement, every body readable.
 *
 * @param {object} win virtual window (or global-ish object)
 * @param {object} [opts] { mode, relayInvoke, onRoute, defaultHeaders,
 *   responseCache (from SmartNet.createResponseCache), onChunk }
 * @returns {object} the installed { fetch, XMLHttpRequest }
 */
function bindPageNet(win, opts = {}) {
	if (!win || typeof win !== "object") throw new Error("SmartNet.bindPageNet: window object required");

	async function pageFetch(input, init = {}) {
		const url = typeof input === "string" ? input : (input && input.url) || String(input);
		const mergedHeaders = Object.assign({}, opts.defaultHeaders || {}, init.headers || {});
		const smartRes = await smartFetch(url, {
			method: init.method || (input && input.method) || "GET",
			headers: mergedHeaders,
			body: init.body,
			mode: opts.mode,
			relayInvoke: opts.relayInvoke,
			onRoute: opts.onRoute,
			timeoutMs: opts.timeoutMs,
			responseCache: opts.responseCache || null,
			onChunk: opts.onChunk
		});
		// B"H: concurrent identical GETs share one network flight inside
		// smartFetch — each page caller still gets its own Response wrapper
		// with an independent consumed flag, over a zero-copy body view.
		return toFetchResponse({ ...smartRes, body: shareBodyView(smartRes.body) });
	}

	// Minimal XHR sufficient for legacy page scripts (open/send, responseText).
	class PageXMLHttpRequest {
		constructor() {
			this.readyState = 0;
			this.status = 0;
			this.statusText = "";
			this.responseText = "";
			this.response = null;
			this.onreadystatechange = null;
			this.onload = null;
			this.onerror = null;
			this.__method = "GET";
			this.__url = "";
			this.__headers = {};
		}
		open(method, url) {
			this.__method = String(method || "GET").toUpperCase();
			this.__url = String(url);
			this.readyState = 1;
		}
		setRequestHeader(name, value) { this.__headers[String(name)] = String(value); }
		__fire(fn) { if (typeof this[fn] === "function") { try { this[fn](); } catch (e) {} } }
		send(body = null) {
			this.readyState = 2;
			smartFetch(this.__url, {
				method: this.__method,
				headers: this.__headers,
				body,
				mode: opts.mode,
				relayInvoke: opts.relayInvoke,
				timeoutMs: opts.timeoutMs
			}).then(async res => {
				this.status = res.status;
				this.statusText = res.statusText || "";
				const b = res.body;
				this.responseText = (typeof Buffer !== "undefined" && Buffer.isBuffer(b) ? b : Buffer.from(b)).toString("utf8");
				this.response = this.responseText;
				this.readyState = 4;
				this.__fire("onreadystatechange");
				this.__fire("onload");
			}).catch(() => {
				this.readyState = 4;
				this.__fire("onreadystatechange");
				this.__fire("onerror");
			});
		}
		abort() { this.readyState = 0; }
		getResponseHeader(name) { return null; }
		getAllResponseHeaders() { return ""; }
	}

	win.fetch = pageFetch;
	win.XMLHttpRequest = PageXMLHttpRequest;
	return { fetch: pageFetch, XMLHttpRequest: PageXMLHttpRequest };
}

const SmartNet = {
	smartFetch,
	smartFetchAll,
	toFetchResponse,
	bindPageNet,
	ResponseCache,
	createResponseCache,
	getNetStats
};

return { SmartNet };

});
