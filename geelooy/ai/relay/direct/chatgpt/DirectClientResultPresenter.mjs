// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Presents direct and recovered answers without exposing sealed credentials.
 * @description
 * The Awtsmoos carries private browser authority only inside encrypted recovery.
 * Awtsmoos.com returns answer, opaque conversation state, timing, and verified close
 * evidence while cookies, headers, upstream request bodies, and sessions stay hidden.
 */
export class DirectClientResultPresenter {
	send(submitted, completed, ledger, closedAt) {
		return {
			answer: completed.answer,
			state: {
				conversationId: completed.conversationId,
				parentMessageId: completed.parentMessageId
			},
			timings: ledger.snapshot(),
			requestLatencyMs: submitted.requestLatencyMs,
			responseStatus: submitted.responseStatus,
			itemCount: completed.itemCount,
			pollCount: completed.pollCount,
			hostReuseSource: submitted.hostReuseSource,
			composerTouched: submitted.composerTouched,
			submissionTransport: submitted.submissionTransport,
			completionSource: completed.completionSource,
			tabLifecycle: {
				ownedTarget: true,
				closedImmediatelyAfterAcceptedSend: true,
				closeVerified: true,
				closedAt,
				continuationMode: "encrypted-detached-authenticated-get"
			}
		};
	}

	recovery(previousState, completed) {
		return {
			answer: completed.answer,
			state: {
				conversationId: completed.conversationId,
				parentMessageId: completed.parentMessageId
			},
			itemCount: completed.itemCount,
			pollCount: completed.pollCount,
			composerTouched: false,
			submissionTransport: "none-recovery-only",
			completionSource: `${completed.completionSource}-recovery`,
			sameConversation: completed.conversationId === previousState.conversationId,
			tabLifecycle: {
				ownedTarget: false,
				closedImmediatelyAfterAcceptedSend: true,
				closeVerified: true,
				continuationMode: "encrypted-detached-authenticated-get-recovery"
			}
		};
	}
}
