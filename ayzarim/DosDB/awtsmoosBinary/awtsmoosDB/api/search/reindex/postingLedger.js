// B"H

/**
 * @file api/search/reindex/postingLedger.js
 * @chapter Every Token Gathers Its Unique Physical Witnesses Once
 * @description Builds an in-memory token-to-pointer ledger from source records.
 */

const IndexOps = require('../indexer/ops.js');
const PhysicalIdentity = require('../indexer/phys_id.js');

function buildPostingLedger(manager, pointers) {
	const postings = new Map();
	let resolvedRecords = 0;
	for (const pointer of pointers) {
		const value = manager._resolveForIndex(pointer);
		if (value === null || value === undefined) continue;
		resolvedRecords++;
		const physicalId = PhysicalIdentity.get(pointer);
		for (const token of IndexOps.extractTokens(value)) {
			let tokenPostings = postings.get(token);
			if (!tokenPostings) {
				tokenPostings = new Map();
				postings.set(token, tokenPostings);
			}
			tokenPostings.set(physicalId, pointer);
		}
	}
	return {
		postings,
		resolvedRecords
	};
}

module.exports = buildPostingLedger;
