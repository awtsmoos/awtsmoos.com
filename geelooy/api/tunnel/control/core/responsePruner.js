// B"H
// Boruch Hashem
// Blessed is He

const { CORE_KEYS, PREVIEW_KEYS } = require("./responsePrunerKeys.js");

/**
 * @file Compacts tunnel responses without discarding durable evidence.
 * @description
 * The Awtsmoos distinguishes noise from testimony. Awtsmoos.com keeps request
 * identity, task output, continuation, write hashes, instruction law, and one bounded
 * stability witness while expanded diagnostics remain available by explicit request.
 */
function pruneTunnelResponse(result = {}, payload = {}) {
	if (!result || typeof result !== "object" || wantsExpanded(payload)) return result;
	const output = {};
	const keepPreview = previewExplicit(payload, result);
	for (const key of Object.keys(result)) {
		if (mayKeep(key, keepPreview)) output[key] = result[key];
	}
	if (result.ok === false && !output.diagnostics) output.diagnostics = compactDiagnostics(result);
	if (keepPreview) preservePreviewShortcut(result, output);
	applyPreviewFocus(result, output, keepPreview);
	return output;
}

/** Returns true when the caller explicitly asked for operational detail. */
function wantsExpanded(payload = {}) {
	const mode = String(payload.responseMode || "").toLowerCase();
	return payload.guidanceDebug === true ||
		payload.guidanceDebug === "true" ||
		["diagnostic", "standard", "debug", "full", "audit", "raw"].includes(mode);
}

/** Determines whether one result key belongs in the default focused response. */
function mayKeep(key, keepPreview) {
	return CORE_KEYS.has(key) && (keepPreview || !PREVIEW_KEYS.has(key));
}

/** Returns true only when preview creation was requested or explicitly required. */
function previewExplicit(payload = {}, result = {}) {
	const requested = [payload.autoPreview, payload.humanPreview, payload.previewRequired]
		.some(value => value === true || value === "true");
	if (requested) return true;
	if (result.previewRequired === true && result.previewPolicy?.enabled !== false) return true;
	return result.responseFocus?.previewRequired === true &&
		result.previewPolicy?.enabled !== false &&
		result.previewRequired !== false;
}

/** Copies a minimal human preview shortcut when preview mode is actually active. */
function preservePreviewShortcut(result, output) {
	const preview = result.createdPreview;
	if (!preview || typeof preview !== "object") return;
	const viewUrl = preview.viewUrl || preview.url || output.viewUrl;
	if (!viewUrl) return;
	output.viewUrl ||= viewUrl;
	output.rawUrl ||= preview.rawUrl || result.rawUrl || "";
	output.wsUrl ||= preview.wsUrl || result.wsUrl || "";
	output.previewDisplayHint ||= preview.previewDisplayHint || preview.source?.previewDisplayHint || "";
	if (!Array.isArray(output.previewLinks) || !output.previewLinks.length) {
		output.previewLinks = [{ id: preview.id || result.previewId || "", viewUrl }];
	}
	output.previewInstruction ||= `Open ${viewUrl}.`;
}

/** Reconciles response focus with the final preview decision. */
function applyPreviewFocus(result, output, keepPreview) {
	const available = output.previewLinks?.length || output.viewUrl || output.createdPreview;
	if (keepPreview && available) {
		output.responseFocus = { ...(output.responseFocus || {}), previewRequired: true };
		return;
	}
	if (output.responseFocus?.previewRequired === true && result.previewRequired === false) {
		output.responseFocus = { ...output.responseFocus, previewRequired: false };
	}
}

/** Builds a bounded failure witness when the action did not supply one. */
function compactDiagnostics(result = {}) {
	return {
		routeReason: result.routeReason,
		tunnelName: result.tunnelName,
		mismatchProof: result.mismatchProof,
		expected: result.expected,
		actual: result.actual
	};
}

module.exports = {
	CORE_KEYS,
	PREVIEW_KEYS,
	previewExplicit,
	pruneTunnelResponse,
	wantsExpanded
};
