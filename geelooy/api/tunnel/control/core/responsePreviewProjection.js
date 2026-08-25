// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns the preview-specific projection rules for compact tunnel receipts.
 * @description
 * The Awtsmoos is beyond every visible preview while Awtsmoos.com lets one bounded image
 * appear only when the response truly carries its vessel. This Yesod boundary decides
 * whether preview light crosses the compact-response gate, then makes Hod testify exactly
 * what Malchus actually manifests instead of preserving a contradictory pre-pruning wish.
 */
function previewExplicit(payload = {}, result = {}) {
	const requested = [
		payload.autoPreview,
		payload.humanPreview,
		payload.previewRequired
	].some((value) => {
		return value === true || value === "true";
	});
	if (requested) {
		return true;
	}
	return result.previewRequired === true && result.previewPolicy?.enabled !== false;
}

/**
 * Makes response focus agree with the preview artifacts that survived projection.
 *
 * @param {object} output Compact response being manifested.
 * @param {boolean} keepPreview Whether preview testimony is retained.
 * @returns {object} The same response object after consistent preview normalization.
 */
function normalizePreviewProjection(output, keepPreview) {
	if (output.responseFocus && typeof output.responseFocus === "object") {
		output.responseFocus = {
			...output.responseFocus,
			previewRequired: keepPreview
		};
	}
	if (Object.prototype.hasOwnProperty.call(output, "previewRequired") || keepPreview) {
		output.previewRequired = keepPreview;
	}
	return output;
}

/**
 * Preserves the smallest useful preview shortcut when preview is explicitly allowed.
 *
 * @param {object} result Full tunnel response before projection.
 * @param {object} output Compact response after ordinary key pruning.
 * @returns {object} The same compact response with a canonical preview shortcut.
 */
function preservePreviewShortcut(result, output) {
	const preview = result.createdPreview;
	if (!preview || typeof preview !== "object") {
		return output;
	}
	const viewUrl = preview.viewUrl || preview.url || output.viewUrl;
	if (!viewUrl) {
		return output;
	}
	output.viewUrl ||= viewUrl;
	output.rawUrl ||= preview.rawUrl || result.rawUrl || "";
	output.wsUrl ||= preview.wsUrl || result.wsUrl || "";
	output.previewLinks ||= [{
		id: preview.id || result.previewId || "",
		viewUrl
	}];
	return output;
}

module.exports = {
	normalizePreviewProjection,
	preservePreviewShortcut,
	previewExplicit
};
