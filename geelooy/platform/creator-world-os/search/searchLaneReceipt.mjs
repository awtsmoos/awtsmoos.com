// B"H
// Boruch Hashem
// Blessed is He
/** @module SearchLaneReceipt @description Records how one search lane admitted a result. */

/** Creates one immutable search-lane receipt. */
export function createSearchLaneReceipt(input) {
	const lane = String(input?.lane || '').trim();
	const objectId = String(input?.objectId || '').trim();
	if (!lane || !objectId) {
		throw new TypeError('Search receipt requires lane and objectId.');
	}
	return Object.freeze({
		lane,
		objectId,
		admitted: input?.admitted !== false,
		rawScore: Number(input?.rawScore || 0),
		reasons: Object.freeze([...(input?.reasons || [])]),
		corpusGeneration: input?.corpusGeneration || null,
		createdAt: String(input?.createdAt || new Date().toISOString())
	});
}

/** Groups lane receipts by result object. */
export function groupSearchReceipts(receipts) {
	return receipts.reduce((groups, receipt) => {
		groups[receipt.objectId] ||= [];
		groups[receipt.objectId].push(receipt);
		return groups;
	}, {});
}
