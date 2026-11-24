//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Live wiring for the revelation transport guard (the 414 eliminator).
 * @description Control routes call guardFsTransport before dispatch. Payload
 * keys belong in POST bodies, never in URLs; oversized bodies are directed to
 * the chunked large-write transfer. Search terms (text/query) and the legacy
 * params/params64 carriers are not treated as payloads here — the guard judges
 * the raw query keys a client actually placed in the URL.
 */

const Transport = require("./transportGuard.js");
const Protocol = require("./protocol.js");
const { bodyJson } = require("../bodyPayload.js");

const SEARCH_KEYS = new Set(["text", "query", "params", "params64"]);

/**
 * @param {object} $i Awtsmoos route context.
 * @returns {null|{status:number, body:object}} Null when the request may
 * proceed; otherwise an HTTP status and a canonical not_accepted body.
 */
function guardFsTransport($i) {
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
	const decision = Transport.decideTransport({ method, url, params, bodyBytes });
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
					guidance: "Send payloads in a POST JSON body; above 32MB use the chunked large-write transfer."
				}
			})
		}
	};
}

module.exports = { guardFsTransport };
