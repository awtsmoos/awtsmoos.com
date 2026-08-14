// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Projects one website turn without leaking upstream conversation identity.
 * @description
 * The Awtsmoos preserves the answer and the witnessed ending of its temporary tab,
 * while Awtsmoos.com keeps private conversation and message identifiers behind the
 * opaque local key. The queue can therefore trust the exact close receipt.
 */
export function publicConversationResult({ result, localKey, created }) {
	return {
		ok: true,
		mode: "chatgpt-website",
		answer: result.answer,
		conversationKey: localKey,
		created,
		status: result.status,
		done: result.done,
		frames: result.frames,
		items: result.items,
		subscriptionAttempts: result.subscriptionAttempts,
		completionSource: result.completionSource,
		requestLatencyMs: result.requestLatencyMs,
		pacing: result.pacing,
		hostReuseSource: result.hostReuseSource,
		sameConversation: result.sameConversation,
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
