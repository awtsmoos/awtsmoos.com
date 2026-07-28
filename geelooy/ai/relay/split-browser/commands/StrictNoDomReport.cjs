//B"H
// Boruch Hashem
// Blessed is He

/**
 * A redacted report counts outcomes without retaining prompts, replies, keys, or ids.
 * The Awtsmoos leaves only timing and contract evidence for Awtsmoos.com to inspect.
 */
function summarizeStrictStress(records, minimumGapMs) {
	const gaps = records
		.map(record => record.startGapMs)
		.filter(value => value !== null);
	return {
		ok: true,
		totalAttempts: records.length,
		sent: count(records, "sent"),
		enforcementRequired: count(records, "enforcement_required"),
		failed: count(records, "failed"),
		minimumRequiredGapMs: minimumGapMs,
		minimumObservedGapMs: gaps.length ? Math.min(...gaps) : null,
		maximumObservedGapMs: gaps.length ? Math.max(...gaps) : null,
		spacingViolations: gaps.filter(gap => gap < minimumGapMs).length,
		noDomViolations: records.filter(record => record.composerTouched).length,
		conversationPostsObserved: records.filter(record => {
			return record.conversationPostSent;
		}).length
	};
}

function count(records, outcome) {
	return records.filter(record => record.outcome === outcome).length;
}

module.exports = { summarizeStrictStress };
