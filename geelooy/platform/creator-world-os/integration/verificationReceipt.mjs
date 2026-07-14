// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module VerificationReceipt
 * @description
 * Seals chapter, train, syntax, behavior, ceiling, and drift proof into one
 * immutable receipt. The Awtsmoos leaves no room for ceremonial completion.
 */

/** Creates a frozen full-verification receipt. */
export function createVerificationReceipt(input) {
	const chapterCount = Number(input?.chapterCount || 0);
	const trainCount = Number(input?.trainCount || 0);
	const checks = Object.freeze({ ...(input?.checks || {}) });
	const failedChecks = Object.entries(checks)
		.filter(([, passed]) => passed !== true)
		.map(([name]) => name);
	if (!Number.isInteger(chapterCount) || chapterCount < 1) {
		throw new TypeError('Verification receipt requires a positive chapterCount.');
	}
	if (!Number.isInteger(trainCount) || trainCount < 1) {
		throw new TypeError('Verification receipt requires a positive trainCount.');
	}
	return Object.freeze({
		id: String(input?.id || `verification:${input?.head || 'working-tree'}`),
		head: String(input?.head || 'working-tree'),
		chapterCount,
		trainCount,
		checks,
		passed: failedChecks.length === 0,
		failedChecks: Object.freeze(failedChecks),
		sourceHashes: Object.freeze({ ...(input?.sourceHashes || {}) }),
		createdAt: String(input?.createdAt || new Date().toISOString()),
		limitations: Object.freeze([...(input?.limitations || [])])
	});
}

/** Throws when a verification receipt contains any failed gate. */
export function assertVerificationPassed(receipt) {
	if (!receipt?.passed) {
		throw new Error(`Verification failed: ${(receipt?.failedChecks || []).join(', ')}`);
	}
	return receipt;
}
