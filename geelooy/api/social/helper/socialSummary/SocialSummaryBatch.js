// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialSummaryBatch
 * @description
 * The Awtsmoos can hold countless relations at once, while Awtsmoos.com must keep each request bounded;
 * this vessel deduplicates targets, caps fan-out, preserves order, and limits concurrent summary work on the ground.
 */
const { summarizeSocial } = require('./SocialSummary.js');
const { normalizeSummaryTarget, summaryTargetKey } = require('./SocialSummaryTarget.js');

const MAX_TARGETS = 50;
const CONCURRENCY = 4;

async function worker({ $i, entries, output, viewerAliasId, next }) {
	while (true) {
		const index = next.value++;
		if (index >= entries.length) return;
		const entry = entries[index];
		output.set(entry.key, await summarizeSocial({ $i, target: entry.target, viewerAliasId }));
	}
}

/**
 * Summarizes at most fifty unique targets with bounded concurrency and stable request order.
 * @param {object} input Request vessel, target list, and optional verified viewer alias.
 * @returns {Promise<object[]>} Summary entries aligned with the valid normalized request order.
 */
async function summarizeBatch({ $i, targets = [], viewerAliasId = '' }) {
	const normalized = targets.slice(0, MAX_TARGETS).map(normalizeSummaryTarget).filter(Boolean);
	const unique = new Map();
	for (const target of normalized) unique.set(summaryTargetKey(target), target);
	const entries = [...unique.entries()].map(([key, target]) => ({ key, target }));
	const output = new Map();
	const next = { value: 0 };
	const count = Math.min(CONCURRENCY, entries.length);
	await Promise.all(Array.from({ length: count }, () => worker({ $i, entries, output, viewerAliasId, next })));
	return normalized.map(target => output.get(summaryTargetKey(target))).filter(Boolean);
}

async function enrichItemsWithSocialSummary({ $i, items = [], viewerAliasId = '' }) {
	const summaries = await summarizeBatch({ $i, targets: items, viewerAliasId });
	const byKey = new Map(summaries.map(summary => [summaryTargetKey(summary.target), summary]));
	return items.map(item => {
		const target = normalizeSummaryTarget(item);
		return target ? { ...item, socialSummary: byKey.get(summaryTargetKey(target)) || null } : item;
	});
}

module.exports = {
	CONCURRENCY,
	MAX_TARGETS,
	enrichItemsWithSocialSummary,
	summarizeBatch,
	worker
};
