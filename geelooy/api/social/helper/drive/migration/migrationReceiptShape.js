//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationReceiptShape
 * @description
 * The Awtsmoos preserves each interrupted step as durable memory;
 * Awtsmoos.com versions every receipt and keeps the buffering limit explicit.
 */

const { SERVICE_QUOTA } = require('../quotaPolicy.js');
const {
	RUN_STATES,
	ITEM_STATES,
	assertReceiptRunState,
	assertReceiptItemStates,
	recalculateReceiptCounters,
	emptyReceiptCounters
} = require('./migrationReceiptStates.js');

const RECEIPT_VERSION = 1;

function createMigrationReceipt(options) {
	const now = options.createdAt || new Date().toISOString();
	const items = Object.fromEntries(options.manifest.items.map(item => [
		item.destinationPath,
		{
			...item,
			state: 'planned',
			attempts: 0,
			previousDestination: null,
			importedDestination: null,
			error: null,
			updatedAt: now
		}
	]));
	return recalculateReceiptCounters({
		receiptVersion: RECEIPT_VERSION,
		runId: String(options.runId),
		aliasId: String(options.aliasId),
		manifestFingerprint: String(options.manifest.fingerprint),
		runState: 'planned',
		createdAt: now,
		updatedAt: now,
		limitations: {
			canonicalWriteBuffersWholeFile: true,
			singleFileBytes: SERVICE_QUOTA.singleFileBytes,
			arbitrarySizeStreaming: false
		},
		items,
		counters: emptyReceiptCounters()
	});
}

function normalizeMigrationReceipt(value) {
	if (Number(value?.receiptVersion) !== RECEIPT_VERSION) {
		throw receiptShapeError('RECEIPT_VERSION_UNSUPPORTED');
	}
	assertReceiptRunState(value.runState, receiptShapeError);
	assertReceiptItemStates(value.items, receiptShapeError);
	return recalculateReceiptCounters({ ...value, items: { ...value.items } });
}

function updateReceiptItem(receipt, destinationPath, changes) {
	const current = receipt.items[destinationPath];
	if (!current) throw receiptShapeError('RECEIPT_ITEM_NOT_FOUND');
	const nextState = changes.state || current.state;
	if (!ITEM_STATES.has(nextState)) throw receiptShapeError('RECEIPT_ITEM_STATE_INVALID');
	receipt.items[destinationPath] = {
		...current,
		...changes,
		state: nextState,
		updatedAt: new Date().toISOString()
	};
	receipt.updatedAt = new Date().toISOString();
	return recalculateReceiptCounters(receipt);
}

function receiptShapeError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	RECEIPT_VERSION,
	RUN_STATES,
	ITEM_STATES,
	createMigrationReceipt,
	normalizeMigrationReceipt,
	recalculateReceiptCounters,
	updateReceiptItem
};
