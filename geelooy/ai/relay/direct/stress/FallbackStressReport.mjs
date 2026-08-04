// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds secret-free evidence for submit-only website dispatch stress.
 * @description
 * The Awtsmoos counts accepted sends and verified closures, never model text.
 * Awtsmoos.com proves every browser vessel vanished and every dispatch observed the
 * global pacing floor without retaining prompts, local keys, or upstream identity.
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
		mode: "chatgpt-website-submit-only",
		configuration: {
			logicalGroups: conversations,
			dispatchesPerGroup: messages,
			totalDispatches: conversations * messages,
			minimumIntervalMs
		},
		conversationCount: {
			before: before.total,
			after: after.total,
			delta: after.total - before.total,
			statusBefore: before.status,
			statusAfter: after.status
		},
		dispatched: records.filter(record => record.dispatched).length,
		promptVerified: records.filter(record => record.promptVerified).length,
		tabCloseVerified: records.filter(record => record.tabCloseVerified).length,
		minimumObservedIntervalMs: intervals.length ? Math.min(...intervals) : null,
		completionSources: [...new Set(records.map(record => record.completionSource))].sort(),
		records
	};
}

export function validateFallbackStressReport(report) {
	const expected = report.configuration.totalDispatches;
	if (report.dispatched !== expected
		|| report.promptVerified !== expected
		|| report.tabCloseVerified !== expected) {
		throw new Error("Not every website prompt was dispatched and closed exactly.");
	}
	if (report.conversationCount.delta < 0) {
		throw new Error("Website conversation count unexpectedly decreased.");
	}
	if (report.minimumObservedIntervalMs !== null
		&& report.minimumObservedIntervalMs < report.configuration.minimumIntervalMs) {
		throw new Error("Website dispatch pacing fell below the required floor.");
	}
	const invalid = report.records.find(record =>
		!record.dispatched || !record.promptVerified || !record.tabCloseVerified
		|| record.completionSource !== "not-awaited-agent-continues-through-tunnel");
	if (invalid) throw new Error("Website submit-only transport contract failed.");
	const serialized = JSON.stringify(report);
	if (/BH_DIRECT_|Bearer\s|\beyJ[A-Za-z0-9_-]{20,}|\bgAAAA|[0-9a-f]{8}-[0-9a-f-]{27,}/i.test(serialized)) {
		throw new Error("Website dispatch report retained a forbidden secret or identifier.");
	}
}
