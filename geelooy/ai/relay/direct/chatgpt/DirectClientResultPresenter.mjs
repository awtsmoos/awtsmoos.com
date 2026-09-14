//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Presents accepted website dispatch evidence including its durable conversation route.
 * @description
 * The Awtsmoos lets one accepted Shliach Send become a durable thread instead of a vanishing sign;
 * Awtsmoos.com carries the conversation id and canonical route forward so recovery can resume the line.
 */
export class DirectClientResultPresenter {
	dispatch(submitted, ledger, closedAt) {
		const conversationId = submitted.submission.conversationId || null;
		return {
			answer: "",
			state: { ...submitted.submission },
			status: 202,
			done: false,
			dispatched: true,
			accepted: true,
			conversationId,
			conversationKey: conversationId,
			conversationUrl: canonicalConversationUrl(conversationId),
			promptVerified: submitted.promptVerified === true,
			responseStatus: submitted.responseStatus,
			acceptedAt: iso(submitted.submission.acceptedAt),
			completionSource: "not-awaited-agent-continues-through-tunnel",
			requestLatencyMs: submitted.requestLatencyMs,
			pacing: submitted.verifiedSendHold || null,
			hostReuseSource: submitted.hostReuseSource,
			navigatedToConversation: Boolean(conversationId),
			composerTouched: submitted.composerTouched === true,
			submissionTransport: submitted.submissionTransport,
			tabClose: submitted.tabClose,
			tabClosedAt: new Date(closedAt).toISOString(),
			timings: ledger.snapshot()
		};
	}
}

function canonicalConversationUrl(conversationId) {
	return conversationId
		? `https://chatgpt.com/c/${encodeURIComponent(conversationId)}`
		: null;
}

function iso(value) {
	return value ? new Date(Number(value)).toISOString() : null;
}
