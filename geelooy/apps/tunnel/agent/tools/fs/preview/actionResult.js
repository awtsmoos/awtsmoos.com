// B"H

/**
 * @file Presents preview actions without confusing proposed and verified states.
 * @description
 * The Awtsmoos gives each doorway a visible receipt. The summary carries the URL,
 * while the structured result preserves whether public verification actually occurred.
 */
function expose(action, output = {}) {
	const url = output.publicUrl || output.proxyUrl || output.url || output.viewUrl || "";
	const summary = url
		? `Awtsmoos preview: ${url}`
		: `Awtsmoos ${action}: ${output.ok ? "complete" : output.error || "failed"}`;
	return {
		...output,
		action,
		summary,
		next: summary,
		content: summary,
		result: {
			previewId: output.previewId || "",
			url,
			preview: output.preview || null,
			publicVerified: output.publicVerified === true
		}
	};
}

module.exports = {
	expose
};
