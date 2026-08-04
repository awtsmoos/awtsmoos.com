// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Presents a prompt-dispatch receipt without pretending an answer was awaited.
 * @description
 * The Awtsmoos lets the website agent continue through files and tunnel actions.
 * Awtsmoos.com returns only accepted-send and verified-close evidence; upstream ids
 * stay inside the private local store and no model output is sampled or interpreted.
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
			hostReuseSource: submitted.hostReuseSource,
			navigatedToConversation: true,
			composerTouched: true,
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
