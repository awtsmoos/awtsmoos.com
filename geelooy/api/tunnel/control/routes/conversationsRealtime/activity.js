// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Publishes redacted conversation registry lifecycle testimony.
 * @description
 * The Awtsmoos renews conversation, registry, and observer while Awtsmoos.com
 * keeps prompts, responses, titles, and metadata bodies inside their HTTP vessel.
 * The activity ledger receives only operation, conversation identifier, count, and outcome.
 */

/** Publishes one conversation route event through the verified account stream. */
function publishConversationActivity(context, identity, eventType, result) {
	if (!identity?.accountId || typeof context.ws?.publishActivity !== "function") {
		return null;
	}
	const summary = summarize(result);
	return context.ws.publishActivity({
		accountId: identity.accountId,
		userId: identity.userId,
		sessionId: identity.sessionId,
		eventType,
		state: summary.ok ? "completed" : "failed",
		severity: summary.ok ? "info" : "error",
		summary: summaryText(eventType, summary),
		detail: {
			conversationId: summary.conversationId,
			conversationCount: summary.count,
			error: summary.error,
			operation: eventType
		}
	});
}

function summarize(result) {
	try {
		const parsed = typeof result === "string" ? JSON.parse(result) : result;
		const records = Array.isArray(parsed)
			? parsed
			: Array.isArray(parsed?.conversations)
				? parsed.conversations
				: [];
		return {
			ok: parsed?.ok !== false,
			conversationId: String(
				parsed?.conversationId || parsed?.id || ""
			).slice(0, 180),
			count: records.length,
			error: String(parsed?.error || "").slice(0, 240)
		};
	} catch {
		return {
			ok: true,
			conversationId: "",
			count: 0,
			error: ""
		};
	}
}

function summaryText(eventType, summary) {
	const operation = eventType.replace("conversation.", "Conversation ");
	return summary.ok ? operation : `${operation} failed`;
}

module.exports = {
	publishConversationActivity,
	summarize
};
