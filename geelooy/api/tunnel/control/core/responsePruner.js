// B"H
// Boruch Hashem
// Blessed is He

const {
	CORE_KEYS,
	PREVIEW_KEYS
} = require("./responsePrunerKeys.js");

/**
 * @file Compacts tunnel responses without discarding durable evidence.
 * @description
 * The Awtsmoos distinguishes noise from testimony. Awtsmoos.com keeps request
 * identity, retry continuity, atomic write hashes, command receipts, and bounded
 * diagnostics while preview links appear only when the caller explicitly seeks them.
 */
function pruneTunnelResponse(result = {}, payload = {}) {
	if (!result || typeof result !== "object" || wantsDebug(payload)) {
		return result;
	}
	const output = {};
	const keepPreview = previewExplicit(payload, result);
	for (const key of Object.keys(result)) {
		if (mayKeep(key, keepPreview)) {
			output[key] = result[key];
		}
	}
	if (result.ok === false && !output.diagnostics) {
		output.diagnostics = compactDiagnostics(result);
	}
	if (keepPreview) {
		preservePreviewShortcut(result, output);
	}
	applyPreviewFocus(result, output, keepPreview);
	return output;
}

function mayKeep(key, keepPreview) {
	return CORE_KEYS.has(key) &&
		(keepPreview || !PREVIEW_KEYS.has(key));
}

function wantsDebug(payload = {}) {
	return payload.guidanceDebug === true ||
		payload.guidanceDebug === "true" ||
		payload.responseMode === "debug" ||
		payload.responseMode === "full";
}

function previewExplicit(payload = {}, result = {}) {
	const requested = [
		payload.autoPreview,
		payload.humanPreview,
		payload.previewRequired
	].some(value => value === true || value === "true");
	if (requested) return true;
	if (result.previewRequired === true && result.previewPolicy?.enabled !== false) {
		return true;
	}
	return result.responseFocus?.previewRequired === true &&
		result.previewPolicy?.enabled !== false &&
		result.previewRequired !== false;
}

function preservePreviewShortcut(result, output) {
	const preview = result.createdPreview;
	if (!preview || typeof preview !== "object") return;
	const viewUrl = preview.viewUrl || preview.url || output.viewUrl;
	if (!viewUrl) return;
	output.viewUrl ||= viewUrl;
	output.rawUrl ||= preview.rawUrl || result.rawUrl || "";
	output.wsUrl ||= preview.wsUrl || result.wsUrl || "";
	output.previewDisplayHint ||= preview.previewDisplayHint ||
		preview.source?.previewDisplayHint ||
		"";
	if (!Array.isArray(output.previewLinks) || !output.previewLinks.length) {
		output.previewLinks = [{
			id: preview.id || result.previewId || "",
			viewUrl
		}];
	}
	output.previewInstruction ||= `Open ${viewUrl}.`;
}

function applyPreviewFocus(result, output, keepPreview) {
	const available = output.previewLinks?.length ||
		output.viewUrl ||
		output.createdPreview;
	if (keepPreview && available) {
		output.responseFocus = {
			...(output.responseFocus || {}),
			previewRequired: true
		};
		return;
	}
	if (output.responseFocus?.previewRequired === true && result.previewRequired === false) {
		output.responseFocus = {
			...output.responseFocus,
			previewRequired: false
		};
	}
}

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
	pruneTunnelResponse
};
