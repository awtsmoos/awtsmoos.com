// B"H
// Boruch Hashem
// Blessed is He

const { putBlob } = require("./blobStore.js");
const { putEphemeral } = require("./ephemeralStore.js");

/**
 * @file Stores complete tunnel evidence outside the compact conversational receipt.
 * @description
 * The Awtsmoos loses no ocean when one cup grows light; Awtsmoos.com places complete
 * evidence behind a hash and an expiring reference, so detail remains available by right
 * while the ordinary connection can move with less serialization weight through the night.
 */
function detailReference(result, payload = {}) {
	const stored = storeEphemeral(result, payload, "tunnel-detail");
	return {
		detailsRef: stored.resultRef,
		detailsBytes: stored.bytes,
		detailsSha256: stored.sha256,
		detailsExpiresAt: stored.expiresAt
	};
}

function ephemeralResponse(result, payload = {}, originalBytes = 0) {
	const stored = storeEphemeral(result, payload, "turn-result");
	return {
		BH: "B\"H",
		ok: result?.ok !== false,
		action: payload.action || result?.action,
		responseMode: "ephemeral",
		externalized: true,
		resultRef: stored.resultRef,
		expiresAt: stored.expiresAt,
		expiresInSeconds: stored.expiresInSeconds,
		bytes: stored.bytes,
		sha256: stored.sha256,
		originalBytes,
		summary: summarizeResult(result)
	};
}

function blobResponse(result, payload = {}, originalBytes = 0) {
	const stored = putBlob({
		body: JSON.stringify(result, null, 2),
		mimeType: "application/json; charset=utf-8",
		ttlSeconds: payload.ttlSeconds,
		meta: {
			action: payload.action || result?.action,
			path: payload.path || payload.p || ""
		}
	});
	const base = String(payload.controlBaseUrl || "").replace(/\/fs\/[^/]+$/, "");
	const contentUrl = `${base}/blob/${stored.id}`;
	return {
		BH: "B\"H",
		ok: result?.ok !== false,
		action: payload.action || result?.action,
		responseMode: "url",
		externalized: true,
		contentUrl,
		viewUrl: `${contentUrl}/view`,
		expiresAt: stored.expiresAt,
		bytes: stored.bytes,
		sha256: stored.sha256,
		originalBytes
	};
}

function storeEphemeral(result, payload, kind) {
	return putEphemeral({
		body: JSON.stringify(result, null, 2),
		mimeType: "application/json; charset=utf-8",
		ttlSeconds: payload.ttlSeconds,
		meta: {
			action: payload.action || result?.action,
			path: payload.path || payload.p || "",
			tunnelName: payload.tunnelName || result?.tunnelName || "",
			turnScoped: true
		},
		kind
	});
}

function summarizeResult(result) {
	if (!result || typeof result !== "object") {
		return "Large scalar result externalized.";
	}
	return `Large ${Object.keys(result).length}-key result externalized.`;
}

module.exports = {
	blobResponse,
	detailReference,
	ephemeralResponse,
	storeEphemeral,
	summarizeResult
};
