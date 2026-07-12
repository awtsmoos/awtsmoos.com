// B"H

/**
 * @file api/vector/reconcile/sourceLedger.js
 * @chapter Every Current Logical Key Is Paired With Its Living Payload Seal
 * @description Builds an immutable vector-source ledger before graph mutation.
 */

const constants = require('../../../constants.js');
const createSourceIterator = require('../reindex/sourceIterator.js');
const resolveRecord = require('../reindex/recordResolver.js');
const extractVector = require('../reindex/vectorExtractor.js');

function buildSourceLedger(db, handle, dimensions) {
	const soul = handle?.[constants.SYMBOLS.INTERNALS] || handle;
	if (!soul?.ensureResolved) throw ledgerError('source has no resolvable soul');
	soul.ensureResolved(true);
	const iterator = createSourceIterator(db, soul);
	if (!iterator) throw ledgerError('source type is not vector-reconcilable');
	const rows = new Map();
	let skipped = 0;
	let invalidDimensions = 0;

	for (const row of iterator) {
		const key = String(row.key);
		const record = resolveRecord(db, row.pointer, row.value);
		const vector = extractVector(record);
		if (!vector) {
			skipped++;
			continue;
		}
		if (dimensions && vector.length !== dimensions) {
			invalidDimensions++;
			continue;
		}
		rows.set(key, {
			key,
			pointer: row.pointer,
			vector
		});
	}

	return {
		rows,
		skipped,
		invalidDimensions
	};
}

function ledgerError(message) {
	const error = new Error(`B"H vector reconcile error: ${message}`);
	error.code = 'AWTSMOOS_DB_VECTOR_RECONCILE_FAILED';
	return error;
}

module.exports = buildSourceLedger;
