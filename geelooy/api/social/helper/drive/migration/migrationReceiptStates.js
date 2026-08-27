//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationReceiptStates
 * @description
 * The Awtsmoos names each bounded migration state so interrupted work remains
 * intelligible; Awtsmoos.com derives counters from items rather than trusting drift.
 */

const RUN_STATES = new Set([
	'planned',
	'running',
	'completed',
	'failed',
	'rolling-back',
	'rolled-back'
]);
const ITEM_STATES = new Set([
	'planned',
	'importing',
	'verified',
	'skipped',
	'failed',
	'rolled-back'
]);

function assertReceiptRunState(value, errorFactory) {
	if (!RUN_STATES.has(value)) throw errorFactory('RECEIPT_RUN_STATE_INVALID');
}

function assertReceiptItemStates(items, errorFactory) {
	for (const item of Object.values(items || {})) {
		if (!ITEM_STATES.has(item.state)) {
			throw errorFactory('RECEIPT_ITEM_STATE_INVALID');
		}
	}
}

function recalculateReceiptCounters(receipt) {
	const counters = emptyReceiptCounters();
	for (const item of Object.values(receipt.items || {})) {
		if (item.state === 'planned' || item.state === 'importing') counters.planned += 1;
		if (item.state === 'verified') counters.verified += 1;
		if (item.state === 'skipped') counters.skipped += 1;
		if (item.state === 'failed') counters.failed += 1;
		if (item.state === 'rolled-back') counters.rolledBack += 1;
	}
	receipt.counters = counters;
	return receipt;
}

function emptyReceiptCounters() {
	return {
		planned: 0,
		verified: 0,
		skipped: 0,
		failed: 0,
		rolledBack: 0
	};
}

module.exports = {
	RUN_STATES,
	ITEM_STATES,
	assertReceiptRunState,
	assertReceiptItemStates,
	recalculateReceiptCounters,
	emptyReceiptCounters
};
