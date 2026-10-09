// B"H
// Boruch Hashem
// Blessed is He
//
// TunnelRelayAction — server-side tunnel action for HTTP relay.
//
// Yaakov: "use the installed tunnel as a relay"
//
// Register in the tunnel action catalog (alongside renderLabActions etc.):
//   const { buildTunnelRelayActions } = require(".../merkava-browser/TunnelRelayAction.js");
//   catalog = { ...catalog, ...buildTunnelRelayActions(ctx) };
//
// Action: "merkavaRelayFetch"
//   payload: { url, method, headers, body64, timeoutMs, maxRedirects }
//   result:  { ok, status, statusText, headers, body64, error }
//
// The host performs the real request with DirectNet (Node http/https, zero
// CORS semantics) and returns the response. Response bodies are base64'd and
// capped at 8MB so tunneled bytes stay bounded.
//
// Security posture (deliberate, documented):
//   - SSRF guard: block loopback/link-local targets by default. The relay is
//     for fetching PUBLIC web resources, not for pivoting into the host's LAN.
//     Override with payload.allowPrivate=true only when the tunnel operator
//     explicitly trusts the guest.
//   - Method allowlist: GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS.
//   - Body cap 8MB; response cap 8MB.

const path = require("path");

let directNetPromise = null;

function directNetPath() {
	return path.resolve(__dirname, "DirectNet.js");
}

async function loadDirectNet() {
	if (!directNetPromise) {
		directNetPromise = Promise.resolve().then(() => {
			const mod = require(directNetPath());
			return mod.DirectNet || mod;
		});
	}
	return await directNetPromise;
}

const METHOD_ALLOWLIST = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);
const MAX_BYTES = 8 * 1024 * 1024;

function isPrivateHost(hostname) {
	const h = String(hostname || "").toLowerCase();
	if (h === "localhost" || h.endsWith(".localhost")) return true;
	if (h === "[::1]" || h === "::1") return true;
	// 127.0.0.0/8
	if (/^127\./.test(h)) return true;
	// 10.0.0.0/8
	if (/^10\./.test(h)) return true;
	// 172.16.0.0/12
	const m172 = h.match(/^172\.(\d+)\./);
	if (m172 && +m172[1] >= 16 && +m172[1] <= 31) return true;
	// 192.168.0.0/16
	if (/^192\.168\./.test(h)) return true;
	// link-local 169.254.0.0/16 (cloud metadata!)
	if (/^169\.254\./.test(h)) return true;
	// .internal / .local mDNS-ish
	if (h.endsWith(".internal") || h.endsWith(".local") || h.endsWith(".lan")) return true;
	return false;
}

function parseJson(value, fallback) {
	if (!value) return fallback;
	if (typeof value === "object") return value;
	try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

/**
 * B"H
 * Chapter: the tunnel gained an HTTP relay so Merkava pages fetch the real
 * web outside CORS, even where direct network is unavailable.
 */
function buildTunnelRelayActions(ctx) {
	const { payload } = ctx || {};
	const p = parseJson(payload, {}) || {};

	async function merkavaRelayFetch() {
		try {
			const url = String(p.url || "");
			if (!url) return { ok: false, error: "missing url" };
			const method = String(p.method || "GET").toUpperCase();
			if (!METHOD_ALLOWLIST.has(method)) {
				return { ok: false, error: "method not allowed: " + method };
			}
			let hostname = "";
			try {
				hostname = new URL(url).hostname;
			} catch (e) {
				return { ok: false, error: "invalid url" };
			}
			if (!p.allowPrivate && isPrivateHost(hostname)) {
				return { ok: false, error: "SSRF guard: private target blocked (" + hostname + ")" };
			}
			const directNet = await loadDirectNet();
			const body = p.body64 ? Buffer.from(String(p.body64), "base64") : null;
			if (body && body.length > MAX_BYTES) {
				return { ok: false, error: "request body exceeds 8MB relay cap" };
			}
			const res = await directNet.directFetch(url, {
				method,
				headers: p.headers || {},
				body,
				timeoutMs: Math.min(Number(p.timeoutMs) || 30000, 60000),
				maxRedirects: Math.min(Number(p.maxRedirects) == null ? 5 : Number(p.maxRedirects), 10)
			});
			if (res.body.length > MAX_BYTES) {
				return { ok: false, error: "response body exceeds 8MB relay cap (" + res.body.length + " bytes)" };
			}
			return {
				ok: res.ok,
				status: res.status,
				statusText: res.statusText,
				headers: res.headers,
				body64: res.body.toString("base64"),
				relayed: true
			};
		} catch (e) {
			return { ok: false, error: String((e && e.message) || e) };
		}
	}

	return { merkavaRelayFetch };
}

module.exports = { buildTunnelRelayActions, RELAY_ACTION: "merkavaRelayFetch", MAX_BYTES };
