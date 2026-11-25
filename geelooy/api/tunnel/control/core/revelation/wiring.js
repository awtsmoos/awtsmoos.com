//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Live wiring for the revelation transport guard (the 414 eliminator).
 * @description Control routes call guardFsTransport AFTER authentication
 * and before dispatch. Payload keys belong in POST bodies, not URLs;
 * oversized bodies are directed to the chunked large-write transfer.
 * Search terms (text/query) and the legacy params/params64 carriers are
 * not treated as payloads here — the guard judges the raw query keys a
 * client actually placed in the URL.
 *
 * LEGACY PLUGIN COMPATIBILITY: the deployed ChatGPT Shliach plugin sends
 * authenticated GET requests and cannot choose POST. When the already-
 * verified identity is a non-cookie credential (API key or OAuth bearer),
 * payload-bearing GETs are admitted up to the guard's legacy ceiling and
 * flow into the same canonical payload, authorization, execution and
 * audit path as POST. Browser-session identities never qualify: a cookie
 * GET must never mutate, so CSRF via navigation, image tags or prefetch
 * stays impossible. Unauthenticated requests never reach this guard —
 * protectedFs rejects them with 401 first.
 */

const Transport = require("./transportGuard.js");
const Protocol = require("./protocol.js");
const { bodyJson } = require("../bodyPayload.js");

const SEARCH_KEYS = new Set(["text", "query", "params", "params64"]);

/** Credential kinds whose bearer is a secret the caller must possess —
 * never an ambient cookie — so a legacy GET admitted for them cannot be
 * triggered by ordinary browser navigation or cross-site embedding. */
const LEGACY_GET_IDENTITY_KINDS = new Set(["apiKey", "oauth"]);

/**
 * @param {object} $i Awtsmoos route context.
 * @param {object} [identity] Identity already verified by the route's
 * authentication step (protectedFs resolves it before calling here).
 * @returns {null|{status:number, body:object}} Null when the request may
 * proceed; otherwise an HTTP status and a canonical not_accepted body.
 */
function guardFsTransport($i, identity = null) {
	const method = String($i?.request?.method || $i?.method || "GET").toUpperCase();
	const get = $i?.paramKinds?.GET || $i?.$_GET || {};
	const params = {};
	for (const [key, value] of Object.entries(get)) {
		if (!SEARCH_KEYS.has(key)) params[key] = value;
	}
	const url = String($i?.request?.url || $i?.url || "");
	let bodyBytes = 0;
	if (method === "POST") {
		try { bodyBytes = Buffer.byteLength(JSON.stringify(bodyJson($i) || {}), "utf8"); } catch { bodyBytes = 0; }
	}
	const legacyGetAllowed = Boolean(identity?.ok && LEGACY_GET_IDENTITY_KINDS.has(identity.kind));
	const decision = Transport.decideTransport({ method, url, params, bodyBytes, legacyGetAllowed });
	if (decision.ok) return null;
	const status = decision.transport === "chunked" ? 413 : method === "GET" ? 414 : 400;
	return {
		status,
		body: {
			BH: "B\"H",
			ok: false,
			error: "transport_guard_rejected",
			message: decision.reason,
			...Protocol.makeResponse({
				status: "not_accepted",
				retryable: false,
				errorCategory: "transport",
				result: {
					transport: decision.transport,
					urlBytes: decision.urlBytes,
					guidance: decision.transport === "chunked"
						? "This request is genuinely oversized for a URL: use the chunked large-write transfer (init, ordered chunks, SHA-256, atomic finalize)."
						: "Send payloads in a POST JSON body, or authenticate the legacy GET transport with an API key / OAuth bearer (browser sessions cannot mutate over GET); above 32MB use the chunked large-write transfer."
				}
			})
		}
	};
}

module.exports = { guardFsTransport, LEGACY_GET_IDENTITY_KINDS };
