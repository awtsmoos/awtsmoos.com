// B"H
// Boruch Hashem
// Blessed is He

/**
 * Publishes bounded live-call lifecycle testimony to the account activity stream.
 * Raw prompts, responses, SSE frames, and conversation bodies must never enter
 * the shared activity ledger.
 */
function publishLiveCallActivity(context, identity, eventType, detail = {}) {
	if (!identity?.accountId || typeof context?.ws?.publishActivity !== "function") {
		return null;
	}
	const event = String(eventType || "live_call.activity").slice(0, 120);
	return context.ws.publishActivity({
		accountId: bounded(identity.accountId, 180),
		userId: bounded(identity.userId, 180),
		sessionId: bounded(identity.sessionId, 180),
		eventType: event,
		state: bounded(detail.state || stateFor(event), 80),
		severity: bounded(detail.severity || "info", 40),
		summary: bounded(detail.summary || summaryFor(event), 240),
		detail: compact({
			streamId: bounded(detail.streamId, 180),
			conversationId: bounded(detail.conversationId, 180),
			eventName: bounded(detail.eventName, 120),
			sequence: finiteNumber(detail.sequence),
			changeCount: finiteNumber(detail.changeCount),
			activeCount: finiteNumber(detail.activeCount),
			error: bounded(detail.error, 240),
			operation: event
		})
	});
}

function bounded(value, limit) {
	return String(value ?? "").slice(0, limit);
}

function finiteNumber(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : undefined;
}

function stateFor(eventType) {
	if (eventType.endsWith("stream_opened")) return "online";
	if (eventType.endsWith("stream_closed")) return "offline";
	if (eventType.endsWith("stream_error")) return "error";
	return "observed";
}

function summaryFor(eventType) {
	return eventType.replace(/^live_call\./, "Live-call ").replace(/_/g, " ");
}

function compact(value) {
	return Object.fromEntries(Object.entries(value).filter(([, item]) => (
		item !== undefined && item !== null && item !== ""
	)));
}

module.exports = {
	bounded,
	finiteNumber,
	publishLiveCallActivity
};
