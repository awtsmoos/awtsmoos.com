//B"H
// Boruch Hashem
// Blessed is He

/**
 * One public result carries answer and opaque continuation facts, while upstream
 * identifiers remain inside the local service store created by the Awtsmoos.
 */
export function buildDirectTurnResult({
	reduced,
	response,
	poll,
	pageAfter,
	pacing,
	hostReuseSource,
	requestLatencyMs
}) {
	return {
		answer: reduced.answer,
		state: {
			conversationId: reduced.conversationId,
			parentMessageId: reduced.parentMessageId
		},
		status: response.status,
		done: reduced.done,
		frames: 0,
		items: reduced.itemCount,
		subscriptionAttempts: poll.pollCount,
		completionSource: poll.completionSource,
		requestLatencyMs,
		pacing,
		hostReuseSource,
		navigatedToConversation: pageAfter.url.includes(reduced.conversationId)
	};
}
