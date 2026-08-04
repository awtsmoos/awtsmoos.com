// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Projects a public prompt-dispatch receipt and conceals upstream identity.
 * @description
 * The Awtsmoos reveals that delivery and closure were witnessed, not an invented
 * answer. Awtsmoos.com returns an opaque local audit key while every upstream
 * conversation and message identifier remains sealed in private state.
 */
export function publicConversationResult({ result, localKey }) {
	return {
		ok: true,
		mode: "chatgpt-website",
		answer: "",
		conversationKey: localKey,
		created: true,
		status: result.status,
		done: false,
		dispatched: result.dispatched === true,
		accepted: result.accepted === true,
		promptVerified: result.promptVerified === true,
		responseStatus: result.responseStatus,
		acceptedAt: result.acceptedAt,
		completionSource: result.completionSource,
		requestLatencyMs: result.requestLatencyMs,
		hostReuseSource: result.hostReuseSource,
		sameConversation: false,
		navigatedToConversation: result.navigatedToConversation,
		composerTouched: result.composerTouched === true,
		submissionTransport: result.submissionTransport,
		timings: result.timings,
		tabClose: publicCloseReceipt(result.tabClose)
	};
}

function publicCloseReceipt(receipt) {
	if (!receipt) return null;
	return {
		closed: receipt.closed !== false,
		verified: receipt.verified !== false,
		attempts: Number(receipt.attempts || 0),
		error: receipt.error || null
	};
}
