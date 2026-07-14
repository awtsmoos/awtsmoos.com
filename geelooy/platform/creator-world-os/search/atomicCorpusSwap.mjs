// B"H
// Boruch Hashem
// Blessed is He
/** @module AtomicCorpusSwap @description Plans reversible generation activation. */

/** Creates a corpus-swap transaction without performing storage writes. */
export function createCorpusSwap(input) {
	const corpusId = String(input?.corpusId || '').trim();
	const fromGeneration = Number(input?.fromGeneration || 0);
	const toGeneration = Number(input?.toGeneration || 0);
	if (!corpusId || !Number.isInteger(toGeneration) || toGeneration < 1) {
		throw new TypeError('Corpus swap requires corpusId and positive toGeneration.');
	}
	if (fromGeneration === toGeneration) {
		throw new TypeError('Corpus swap must change generations.');
	}
	return Object.freeze({
		corpusId,
		fromGeneration: fromGeneration || null,
		toGeneration,
		state: 'planned',
		plannedAt: String(input?.plannedAt || new Date().toISOString()),
		validationReceipt: input?.validationReceipt || null,
		rollbackGeneration: fromGeneration || null
	});
}

/** Marks a validated swap committed while preserving rollback identity. */
export function commitCorpusSwap(swap, committedAt = new Date().toISOString()) {
	if (!swap?.validationReceipt) {
		throw new TypeError('Corpus swap requires validation before commit.');
	}
	return Object.freeze({ ...swap, state: 'committed', committedAt });
}
