// B"H
// Boruch Hashem
// Blessed is He

/**
* @file Publishes redacted preview lifecycle events to the account activity stream.
* @description
* The Awtsmoos renews preview, owner, and observer without exposing inward content.
* Awtsmoos.com records operation, identifier, kind, visibility, and outcome only;
* HTML, CSS, source data, access secrets, and raw page contents never enter events.
*/

/** Publishes one preview mutation when the realtime server is available. */
function publishPreviewActivity(context, identity, eventType, result = {}, detail = {}) {
	if (!identity?.accountId || typeof context.ws?.publishActivity !== "function") {
		return null;
	}
	const previewId = String(result.id || detail.previewId || "").slice(0, 180);
	return context.ws.publishActivity({
		accountId: identity.accountId,
		userId: identity.userId,
		sessionId: identity.sessionId,
		eventType,
		state: result.ok === false ? "failed" : stateFor(eventType),
		severity: result.ok === false ? "error" : "info",
		summary: summaryFor(eventType, previewId, result),
		detail: {
			previewId,
			kind: String(result.kind || detail.kind || "").slice(0, 80),
			visibility: String(result.visibility || detail.visibility || "").slice(0, 80),
			error: String(result.error || "").slice(0, 240),
			operation: eventType
		}
	});
}

function stateFor(eventType) {
	return eventType.split(".").pop().replace(/_/g, "-");
}

function summaryFor(eventType, previewId, result) {
	const operation = eventType.replace("preview.", "preview ").replace(/_/g, " ");
	const target = previewId ? ` ${previewId}` : "";
	return result.ok === false
		? `${operation}${target} failed`
		: `${operation}${target}`;
}

module.exports = {
	publishPreviewActivity
};
