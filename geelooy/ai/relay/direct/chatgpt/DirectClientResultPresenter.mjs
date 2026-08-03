// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Presents detached website results without persisting authentication secrets.
 * @description
 * The Awtsmoos returns the completed answer and only conversation identifiers in
 * durable state. Cookies remain in the memory-only vault and vanish after success;
 * public presenters continue exposing only redacted close and transport evidence.
 */
export class DirectClientResultPresenter {
	send(submitted, poll, ledger, closedAt) {
		return {
			answer: poll.answer,
			state: {
				conversationId: poll.conversationId,
				parentMessageId: poll.parentMessageId
			},
			status: 200,
			done: poll.done,
			frames: 0,
			items: poll.itemCount,
			subscriptionAttempts: poll.pollCount,
			completionSource: poll.completionSource,
			requestLatencyMs: submitted.requestLatencyMs,
			pacing: null,
			hostReuseSource: submitted.hostReuseSource,
			navigatedToConversation: true,
			composerTouched: true,
			submissionTransport: submitted.submissionTransport,
			tabClose: submitted.tabClose,
			tabClosedAt: new Date(closedAt).toISOString(),
			timings: ledger.snapshot()
		};
	}

	recovery(state, poll) {
		return {
			answer: poll.answer,
			state: { ...state, parentMessageId: poll.parentMessageId },
			status: 200,
			done: true,
			frames: 0,
			items: poll.itemCount,
			subscriptionAttempts: poll.pollCount,
			completionSource: `${poll.completionSource}-recovery`,
			requestLatencyMs: 0,
			pacing: null,
			hostReuseSource: "none-detached",
			navigatedToConversation: false,
			composerTouched: false,
			submissionTransport: "none-detached-recovery"
		};
	}
}
