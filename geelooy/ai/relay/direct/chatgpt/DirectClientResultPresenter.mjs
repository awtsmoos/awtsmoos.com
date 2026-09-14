// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Presents an accepted website dispatch without pretending an answer was awaited.
 * @description
 * The Awtsmoos lets a Shliach continue through durable Tunnel and Mission Room tools.
 * Awtsmoos.com returns accepted-Send, pacing, and verified-close evidence only; private
 * upstream identifiers remain inside the opaque local conversation store.
 */
export class DirectClientResultPresenter {
	dispatch(submitted, ledger, closedAt) {
		return {
			answer: "",
			state: { ...submitted.submission },
			status: 202,
			done: false,
			dispatched: true,
			accepted: true,
			promptVerified: submitted.promptVerified === true,
			responseStatus: submitted.responseStatus,
			acceptedAt: iso(submitted.submission.acceptedAt),
			completionSource: "not-awaited-agent-continues-through-tunnel",
			requestLatencyMs: submitted.requestLatencyMs,
			pacing: submitted.verifiedSendHold || null,
			hostReuseSource: submitted.hostReuseSource,
			navigatedToConversation: Boolean(submitted.submission.conversationId),
			composerTouched: submitted.composerTouched === true,
			submissionTransport: submitted.submissionTransport,
			tabClose: submitted.tabClose,
			tabClosedAt: new Date(closedAt).toISOString(),
			timings: ledger.snapshot()
		};
	}
}

function iso(value) {
	return value ? new Date(Number(value)).toISOString() : null;
}
