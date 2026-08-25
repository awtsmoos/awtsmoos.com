// B"H
// Boruch Hashem
// Blessed is He

const Connection = require("./connectionReceipt.js");
const Preview = require("./responsePreviewProjection.js");
const { DIAGNOSTIC_KEYS } = require("./responseDiagnosticKeys.js");
const { PREVIEW_KEYS, RECEIPT_KEYS } = require("./responsePrunerKeys.js");

/**
 * @file Projects a large tunnel result into one internally consistent connection receipt.
 * @description
 * The Awtsmoos keeps the whole truth while Awtsmoos.com reveals only testimony needed for
 * this turn: identity, requested output, durable proof, next work, and a small health pulse.
 * Gevurah prunes diagnostic oceans, Hod preserves exact mutation testimony, and preview
 * manifestation is delegated to one focused Yesod vessel so this coordinator stays clear.
 */
function pruneTunnelResponse(result = {}, payload = {}) {
	if (!result || typeof result !== "object") {
		return result;
	}
	const output = {};
	const keepPreview = Preview.previewExplicit(payload, result);
	for (const key of Object.keys(result)) {
		if (mayKeep(key, keepPreview)) {
			output[key] = result[key];
		}
	}
	output.queueSummary = queueSummary(result);
	output.connectionContext = Connection.connectionReceipt(result);
	output.responseShape = "connection-receipt-v1";
	Preview.normalizePreviewProjection(output, keepPreview);
	if (result.ok === false && !output.diagnostics) {
		output.diagnostics = compactDiagnostics(result);
	}
	if (keepPreview) {
		Preview.preservePreviewShortcut(result, output);
	}
	return removeEmptyHelpers(output);
}

function mayKeep(key, keepPreview) {
	if (DIAGNOSTIC_KEYS.has(key)) {
		return false;
	}
	if (!RECEIPT_KEYS.has(key)) {
		return false;
	}
	return keepPreview || !PREVIEW_KEYS.has(key);
}

function queueSummary(result = {}) {
	const stats = result.queueStats || {};
	return {
		lane: result.lane || null,
		inflight: numberOrZero(stats.inflight),
		queued: numberOrZero(stats.queued),
		retryAfterMs: numberOrZero(result.retryAfterMs),
		advisoryOvertime: result.advisoryOvertime === true
	};
}

function compactDiagnostics(result = {}) {
	return {
		routeReason: result.routeReason,
		mismatchProof: result.mismatchProof,
		expected: result.expected,
		actual: result.actual
	};
}

function removeEmptyHelpers(output) {
	if (!output.queueSummary.lane && !output.queueSummary.inflight &&
		!output.queueSummary.queued && !output.queueSummary.retryAfterMs) {
		delete output.queueSummary;
	}
	return output;
}

function numberOrZero(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}

module.exports = {
	CORE_KEYS: RECEIPT_KEYS,
	PREVIEW_KEYS,
	RECEIPT_KEYS,
	normalizePreviewProjection: Preview.normalizePreviewProjection,
	previewExplicit: Preview.previewExplicit,
	pruneTunnelResponse,
	queueSummary
};
