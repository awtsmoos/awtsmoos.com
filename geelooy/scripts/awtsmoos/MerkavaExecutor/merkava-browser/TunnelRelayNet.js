// B"H
// Boruch Hashem
// Blessed is He
//
// TunnelRelayNet — tunnel-relay HTTP client for the Merkava browser.
//
// Yaakov: "or use the installed tunnel as a relay"
//
// When direct network access is unavailable, filtered, or undesirable (e.g.
// the Merkava browser running as a mobile app on a restricted network), HTTP
// requests can be relayed through the installed Awtsmoos tunnel: the browser
// sends a request descriptor through the tunnel protocol, the tunnel HOST
// performs the real HTTP request (Node, no CORS), and returns the response.
//
// This module is the CLIENT side. It takes an `invoke` function —
//   invoke(actionName, payload) -> Promise<result>
// — which the host wires to the real tunnel transport. It never assumes a
// specific transport, so it works with the native tunnel, a test double,
// or any future relay.
//
// Server-side contract (see TunnelRelayAction.js, same directory):
//   action: "merkavaRelayFetch"
//   payload: { url, method, headers, body64, timeoutMs, maxRedirects }
//   result:  { ok, status, statusText, headers, body64, error }
//
// Design: zero dependencies, small module, injectable transport.

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.TunnelRelayNet = factory().TunnelRelayNet;
	}
})(typeof self !== "undefined" ? self : this, function() {

const RELAY_ACTION = "merkavaRelayFetch";
const MAX_BODY_BYTES = 8 * 1024 * 1024; // 8MB relay cap — tunneled bytes stay bounded

function toBody64(body) {
	if (body == null) return null;
	let buf;
	if (typeof Buffer !== "undefined" && Buffer.isBuffer(body)) buf = body;
	else if (body instanceof Uint8Array) buf = typeof Buffer !== "undefined" ? Buffer.from(body) : body;
	else buf = String(body);
	const bytes = buf.length != null ? buf.length : buf.byteLength;
	if (bytes > MAX_BODY_BYTES) throw new Error("TunnelRelayNet: body exceeds 8MB relay cap");
	if (typeof Buffer !== "undefined" && Buffer.isBuffer(buf)) return buf.toString("base64");
	// Uint8Array fallback without Buffer
	let bin = "";
	const u8 = buf instanceof Uint8Array ? buf : new TextEncoder().encode(String(body));
	for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
	if (typeof btoa === "function") return btoa(bin);
	throw new Error("TunnelRelayNet: no base64 encoder available");
}

function fromBody64(body64) {
	if (!body64) return typeof Buffer !== "undefined" ? Buffer.alloc(0) : new Uint8Array(0);
	if (typeof Buffer !== "undefined") return Buffer.from(body64, "base64");
	const bin = typeof atob === "function" ? atob(body64) : "";
	const u8 = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
	return u8;
}

/**
 * Build a relay client bound to a tunnel invoker.
 * @param {(action: string, payload: object) => Promise<object>} invoke
 * @returns {{ relayFetch, RELAY_ACTION, MAX_BODY_BYTES }}
 */
function createTunnelRelay(invoke) {
	if (typeof invoke !== "function") {
		throw new Error("TunnelRelayNet: invoke(action, payload) function is required");
	}

	/**
	 * Perform an HTTP request relayed through the Awtsmoos tunnel.
	 * The tunnel host makes the real request (no CORS there either).
	 * @param {string} url
	 * @param {object} [options] { method, headers, body, timeoutMs, maxRedirects }
	 * @returns {Promise<{ok,status,statusText,headers,body:Buffer|Uint8Array,relayed:true}>}
	 */
	async function relayFetch(url, options = {}) {
		const payload = {
			url: String(url),
			method: (options.method || "GET").toUpperCase(),
			headers: options.headers || {},
			body64: toBody64(options.body),
			timeoutMs: options.timeoutMs || 30000,
			maxRedirects: options.maxRedirects == null ? 5 : options.maxRedirects
		};
		const result = await invoke(RELAY_ACTION, payload);
		if (!result || typeof result !== "object") {
			throw new Error("TunnelRelayNet: invalid relay response");
		}
		if (result.error) {
			throw new Error("TunnelRelayNet relay error: " + result.error);
		}
		return {
			ok: !!result.ok,
			status: result.status || 0,
			statusText: result.statusText || "",
			headers: result.headers || {},
			body: fromBody64(result.body64),
			relayed: true
		};
	}

	return { relayFetch, RELAY_ACTION, MAX_BODY_BYTES };
}

/**
 * In-memory test double for the tunnel transport. Routes relayed requests
 * through DirectNet locally (same semantics the real tunnel host provides).
 * For tests only — never in production.
 */
function createTestInvoker() {
	let directNet = null;
	try {
		if (typeof require === "function") directNet = require("./DirectNet.js").DirectNet;
	} catch (e) { /* resolved by caller in ESM contexts */ }
	return {
		setDirectNet(dn) { directNet = dn; },
		async invoke(action, payload) {
			if (action !== RELAY_ACTION) throw new Error("unknown relay action: " + action);
			if (!directNet) throw new Error("test invoker: DirectNet not wired");
			const body = payload.body64
				? (typeof Buffer !== "undefined" ? Buffer.from(payload.body64, "base64") : null)
				: null;
			const res = await directNet.directFetch(payload.url, {
				method: payload.method,
				headers: payload.headers,
				body,
				timeoutMs: payload.timeoutMs,
				maxRedirects: payload.maxRedirects
			});
			return {
				ok: res.ok,
				status: res.status,
				statusText: res.statusText,
				headers: res.headers,
				body64: res.body.toString("base64")
			};
		}
	};
}

const TunnelRelayNet = {
	createTunnelRelay,
	createTestInvoker,
	RELAY_ACTION,
	MAX_BODY_BYTES
};

return { TunnelRelayNet };

});
