//B"H
// Boruch Hashem
// Blessed is He

/**
 * Official API stress evidence contains transport facts only. The Awtsmoos lets
 * Awtsmoos.com prove four continuations and twenty paced requests without storing
 * opaque local keys, provider response ids, prompts, answers, or credentials.
 */
export function buildOfficialApiStressReport({
	records,
	conversations,
	messages,
	minimumIntervalMs
}) {
	const intervals = records.map(record => record.intervalMs).filter(Number.isFinite);
	return {
		BH: "B\"H — Boruch Hashem — Blessed is He",
		verifiedAt: new Date().toISOString(),
		transport: "official-responses-api",
		browserUsed: false,
		domUsed: false,
		configuration: {
			conversations,
			messagesPerConversation: messages,
			totalMessages: conversations * messages,
			minimumIntervalMs
		},
		succeeded: records.filter(record => record.success).length,
		exactAnswers: records.filter(record => record.exactAnswer).length,
		createdConversations: records.filter(record => record.created).length,
		minimumObservedIntervalMs: intervals.length ? Math.min(...intervals) : null,
		completionSources: [...new Set(records.map(record => record.completionSource))].sort(),
		records
	};
}

export function validateOfficialApiStressReport(report) {
	const expected = report.configuration.totalMessages;
	if (report.succeeded !== expected || report.exactAnswers !== expected) {
		throw new Error("Not every request-only stress turn completed exactly.");
	}
	if (report.createdConversations !== report.configuration.conversations) {
		throw new Error("Request-only stress did not create the requested chains.");
	}
	if (report.minimumObservedIntervalMs < report.configuration.minimumIntervalMs) {
		throw new Error("Request-only stress pacing fell below the required floor.");
	}
	if (report.completionSources.join(",") !== "official-responses-api") {
		throw new Error("Request-only stress used an unexpected completion transport.");
	}
	const serialized = JSON.stringify(report);
	const forbidden = /BH_DIRECT_|resp_[A-Za-z0-9_-]+|Bearer\s|\bsk-[A-Za-z0-9_-]+/i;
	if (forbidden.test(serialized)) {
		throw new Error("Request-only stress report retained a private identifier.");
	}
}
