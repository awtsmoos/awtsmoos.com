// B"H

/**
 * @file api/vector/reconcile/indexReconciler.js
 * @chapter Shifted Sequence Keys Are Rebound To Their Present Payload Seals
 * @description
 * Reconciles logical keys with current payload pointers, retiring stale nodes and
 * inserting only changed records inside one registry transaction.
 */

const buildSourceLedger = require('./sourceLedger.js');
const mutation = require('../mutation.js');

function reconcileVectorIndex(manager, handleOrPath) {
	const path = String(require('../pathResolver.js').pathOf(handleOrPath));
	const handle = require('../pathResolver.js').resolvePath(manager.db, path);
	const index = manager.getIndex(path);
	if (!handle || !index) throw reconcileError(`indexed source is missing: ${path}`);
	const dimensions = Number(index.meta?.dim || 0);
	const source = buildSourceLedger(manager.db, handle, dimensions);
	const report = createReport(path, source);

	manager.db.batch(() => mutation.withRegistry(index, () => {
		retireMismatches(index, source.rows, report);
		insertMissing(index, source.rows, report);
		selectLivingEntry(index);
		manager.persistIndex(path, index);
	}));

	report.registryCount = index.registry.count();
	report.entryNodeID = index.entryNodeID;
	return report;
}

function retireMismatches(index, sourceRows, report) {
	for (const [key, id] of index.keys.entries()) {
		const node = index.registry.getNode(Number(id));
		const source = sourceRows.get(String(key));
		if (node && !node.deleted && source && samePointer(node.payloadPtr, source.pointer)) {
			report.retained++;
			sourceRows.delete(String(key));
			continue;
		}
		if (node && !node.deleted) {
			node.deleted = true;
			index.registry.saveNode(node);
		}
		index.keys.remove(key);
		report.retired++;
	}
}

function insertMissing(index, sourceRows, report) {
	for (const row of sourceRows.values()) {
		if (!Buffer.isBuffer(row.pointer)) {
			report.skippedPointers++;
			continue;
		}
		index.insert(row.key, row.vector, row.pointer);
		report.inserted++;
	}
}

function selectLivingEntry(index) {
	let selected = null;
	for (let id = 0; id < index.registry.count(); id++) {
		const node = index.registry.getNode(id);
		if (!node || node.deleted) continue;
		if (!selected || node.level > selected.level) selected = node;
	}
	index.entryNodeID = selected ? selected.id : -1;
	index.maxLevel = selected ? selected.level : 0;
	index.meta.entryNodeID = index.entryNodeID;
	index.meta.maxLevel = index.maxLevel;
}

function samePointer(left, right) {
	return Buffer.isBuffer(left)
		&& Buffer.isBuffer(right)
		&& left.length === right.length
		&& left.equals(right);
}

function createReport(path, source) {
	return {
		path,
		sourceVectors: source.rows.size,
		skippedVectors: source.skipped,
		invalidDimensions: source.invalidDimensions,
		retained: 0,
		retired: 0,
		inserted: 0,
		skippedPointers: 0,
		registryCount: 0,
		entryNodeID: -1
	};
}

function reconcileError(message) {
	const error = new Error(`B"H vector reconcile error: ${message}`);
	error.code = 'AWTSMOOS_DB_VECTOR_RECONCILE_FAILED';
	return error;
}

module.exports = reconcileVectorIndex;
