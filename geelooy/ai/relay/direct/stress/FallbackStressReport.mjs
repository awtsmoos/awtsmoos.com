//B"H
// Boruch Hashem
// Blessed is He

/**
 * Website stress evidence stores transport truth, never local keys or upstream ids.
 * The Awtsmoos verifies continuity, pacing, composer submission, authenticated GET
 * completion, exact replies, and new-chat count without retaining conversation text.
 */
export function buildFallbackStressReport({
	records,
	conversations,
	messages,
	minimumIntervalMs,
	before,
	after
}) {
	const intervals = records.map(record => record.intervalMs).filter(Number.isFinite);
	return {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		verifiedAt: new Date().toISOString(),
		mode: "chatgpt-website",
		configuration: {
			conversations,
			messagesPerConversation: messages,
			totalMessages: conversations * messages,
			minimumIntervalMs
		},
		conversationCount: {
			before: before.total,
			after: after.total,
			delta: after.total - before.total,
			statusBefore: before.status,
			statusAfter: after.status
		},
		succeeded: records.filter(record => record.success).length,
		exactAnswers: records.filter(record => record.exactAnswer).length,
		createdTurns: records.filter(record => record.created).length,
		minimumObservedIntervalMs: intervals.length ? Math.min(...intervals) : null,
		completionSources: [...new Set(records.map(record => record.completionSource))].sort(),
		records
	};
}

export function validateFallbackStressReport(report) {
	const expected = report.configuration.totalMessages;
	if (report.succeeded !== expected || report.exactAnswers !== expected) {
		throw new Error("Not every ChatGPT website stress turn completed exactly.");
	}
	if (report.createdTurns !== report.configuration.conversations) {
		throw new Error("Website stress did not create exactly the requested chats.");
	}
	if (report.conversationCount.delta !== report.configuration.conversations) {
		throw new Error("Authenticated conversation count did not increase as expected.");
	}
	if (report.minimumObservedIntervalMs < report.configuration.minimumIntervalMs) {
		throw new Error("Website stress pacing fell below the required floor.");
	}
	const invalid = report.records.find(record => {
		return !record.sameConversation
			|| !record.navigatedToConversation
			|| !record.composerTouched
			|| record.submissionTransport !== "chatgpt-website-composer";
	});
	if (invalid) throw new Error("Website submission or continuity contract failed.");
	const serialized = JSON.stringify(report);
	if (/BH_DIRECT_|Bearer\s|\beyJ[A-Za-z0-9_-]{20,}|\bgAAAA|[0-9a-f]{8}-[0-9a-f-]{27,}/i.test(serialized)) {
		throw new Error("Website stress report retained a forbidden secret or identifier.");
	}
}
