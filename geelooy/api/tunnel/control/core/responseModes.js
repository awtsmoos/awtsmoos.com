// B"H
// Boruch Hashem
// Blessed is He

const Externalization = require("./responseExternalization.js");

const DEFAULT_MAX_INLINE_BYTES = 8000;
const MODES = new Set([
	"receipt",
	"detail",
	"debug",
	"inline",
	"auto",
	"ephemeral",
	"ref",
	"url"
]);

/**
 * @file Chooses how much tunnel evidence should travel inline for one response.
 * @description
 * The Awtsmoos gives every truth its proper vessel; Awtsmoos.com keeps ordinary replies
 * light, permits explicit detail, and hands large evidence to a reference-bearing store
 * without confusing presentation policy with persistence machinery at the shore.
 */
function jsonBytes(value) {
	try {
		return Buffer.byteLength(JSON.stringify(value), "utf8");
	} catch (_error) {
		return 0;
	}
}

function normalizeMode(value) {
	const mode = String(value || "receipt").toLowerCase();
	if (mode === "full") {
		return "debug";
	}
	return MODES.has(mode) ? mode : "receipt";
}

function shouldExternalize(payload = {}, bytes = 0) {
	const mode = normalizeMode(payload.responseMode);
	if (["url", "ephemeral", "ref"].includes(mode)) {
		return true;
	}
	if (mode !== "auto") {
		return false;
	}
	const requested = Number(payload.maxInlineBytes || DEFAULT_MAX_INLINE_BYTES);
	const limit = Math.max(1000, requested || DEFAULT_MAX_INLINE_BYTES);
	return bytes > limit;
}

function maybeExternalize(result, payload = {}) {
	const bytes = jsonBytes(result);
	if (!shouldExternalize(payload, bytes)) {
		return result;
	}
	if (normalizeMode(payload.responseMode) === "url") {
		return Externalization.blobResponse(result, payload, bytes);
	}
	return Externalization.ephemeralResponse(result, payload, bytes);
}

module.exports = {
	DEFAULT_MAX_INLINE_BYTES,
	detailReference: Externalization.detailReference,
	jsonBytes,
	maybeExternalize,
	normalizeMode,
	shouldExternalize
};
