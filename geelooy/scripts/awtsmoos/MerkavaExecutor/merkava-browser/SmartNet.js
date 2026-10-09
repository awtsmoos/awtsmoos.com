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

/**
 * Smart fetch: direct first, tunnel relay as fallback.
 *
 * @param {string} url
 * @param {object} [options] { method, headers, body, timeoutMs, maxRedirects,
 *   mode: "auto"|"direct"|"relay", relayInvoke, onRoute }
 * @returns {Promise<{ok,status,statusText,headers,body,url,route}>}
 *   route is "direct" or "relay".
 */
async function smartFetch(url, options = {}) {
	const { DirectNet, TunnelRelayNet } = loadSiblings();
	if (!DirectNet) throw new Error("SmartNet: DirectNet.js not available");
	const mode = options.mode || "auto";
	const onRoute = typeof options.onRoute === "function" ? options.onRoute : null;
	const directOpts = {
		method: options.method,
		headers: options.headers,
		body: options.body,
		timeoutMs: options.timeoutMs,
		maxRedirects: options.maxRedirects
	};

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

	if (mode === "relay") return await viaRelay("forced relay mode");

	try {
		const res = await DirectNet.directFetch(url, directOpts);
		if (onRoute) { try { onRoute("direct", null); } catch (e) {} }
		return { ...res, route: "direct" };
	} catch (directErr) {
		if (mode === "direct") throw directErr;
		// auto: fall back to relay
		return await viaRelay("direct failed: " + (directErr && directErr.message));
	}
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
 * @param {object} [opts] { mode, relayInvoke, onRoute, defaultHeaders }
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
			timeoutMs: opts.timeoutMs
		});
		return toFetchResponse(smartRes);
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
	toFetchResponse,
	bindPageNet
};

return { SmartNet };

});
