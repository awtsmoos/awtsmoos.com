// B"H

/**
 * @file api/vector/audit.js
 * @chapter Every Live Node Is Named Exactly Once In The Key Ledger
 * @description
 * Audits persisted HNSW nodes, vectors, neighbors, payload seals, and the complete
 * key-to-node mapping without relying on logical keys being duplicated in node bodies.
 */

const SmartPointer = require('../../utils/smartPointer.js');

function auditVectorIndex(manager, handleOrPath) {
	const status = manager.indexStatus(handleOrPath);
	const report = createReport(status);
	if (!status.usable) {
		report.errors.push('index is not usable');
		return finish(report);
	}
	const liveNodeIds = new Set();
	for (let id = 0; id < status.registryCount; id++) {
		inspectNode(manager, status.index, id, report, liveNodeIds);
	}
	inspectKeyEntries(manager, status.index, report, liveNodeIds);
	if (report.entryNodeID < 0 || report.entryNodeID >= report.registryCount) {
		report.errors.push(`entry node is out of range: ${report.entryNodeID}`);
	}
	return finish(report);
}

function createReport(status) {
	return {
		path: status.path,
		configured: status.configured,
		usable: status.usable,
		registryCount: status.registryCount,
		entryNodeID: status.entryNodeID,
		dimensions: Number(status.index?.meta?.dim || 0),
		metric: status.index?.meta?.metric || null,
		loadedNodes: 0,
		liveNodes: 0,
		deletedNodes: 0,
		neighborEdges: 0,
		keyCount: 0,
		persistedKeyCount: 0,
		errors: []
	};
}

function inspectNode(manager, index, id, report, liveNodeIds) {
	const node = index.registry.getNode(id);
	if (!node) {
		report.errors.push(`node ${id} could not be loaded`);
		return;
	}
	report.loadedNodes++;
	if (node.id !== id) report.errors.push(`node id mismatch ${id}->${node.id}`);
	inspectVector(node, report);
	inspectPayload(node, id, report, manager.db.allocator.cursor);
	for (const neighbors of node.neighbors || []) inspectNeighbors(id, neighbors, report);
	if (node.deleted) report.deletedNodes++;
	else {
		report.liveNodes++;
		liveNodeIds.add(id);
	}
}

function inspectKeyEntries(manager, index, report, liveNodeIds) {
	const entries = index.keys.entries();
	const mappedNodeIds = new Set();
	for (const [key, id] of entries) {
		if (!Number.isInteger(id) || id < 0 || id >= report.registryCount) {
			report.errors.push(`key ${key} points to invalid node ${id}`);
			continue;
		}
		if (!liveNodeIds.has(id)) report.errors.push(`key ${key} points to deleted node ${id}`);
		if (mappedNodeIds.has(id)) report.errors.push(`node ${id} has more than one logical key`);
		mappedNodeIds.add(id);
		report.keyCount++;
	}
	for (const id of liveNodeIds) {
		if (!mappedNodeIds.has(id)) report.errors.push(`live node ${id} has no logical key`);
	}
	if (manager.db.options?.readOnly) inspectPersistedEntries(index, report, entries);
}

function inspectPersistedEntries(index, report, liveEntries) {
	const persisted = index.keys.persistedEntries();
	report.persistedKeyCount = persisted.length;
	const expected = new Map(liveEntries.map(([key, id]) => [String(key), Number(id)]));
	for (const [key, id] of persisted) {
		if (expected.get(String(key)) !== Number(id)) {
			report.errors.push(`persisted key ${key} differs from live key mapping`);
		}
	}
	if (persisted.length !== expected.size) report.errors.push('persisted key count differs from live key count');
}

function inspectVector(node, report) {
	if (!(node.vector instanceof Float32Array)) report.errors.push(`node ${node.id} vector is not Float32Array`);
	else if (report.dimensions && node.vector.length !== report.dimensions) report.errors.push(`node ${node.id} has ${node.vector.length} dimensions`);
	else if (!finiteVector(node.vector)) report.errors.push(`node ${node.id} contains non-finite coordinates`);
}

function inspectNeighbors(id, neighbors, report) {
	for (const neighborId of neighbors || []) {
		report.neighborEdges++;
		if (!Number.isInteger(neighborId) || neighborId < 0 || neighborId >= report.registryCount) {
			report.errors.push(`node ${id} has invalid neighbor ${neighborId}`);
		}
	}
}

function inspectPayload(node, id, report, logicalBytes) {
	if (!Buffer.isBuffer(node.payloadPtr) || node.payloadPtr.length === 0) {
		report.errors.push(`node ${id} has no payload pointer`);
		return;
	}
	let pointer;
	try { pointer = SmartPointer.decode(node.payloadPtr); }
	catch (error) { report.errors.push(`node ${id} payload decode failed: ${error.message}`); return; }
	if (!pointer) report.errors.push(`node ${id} payload pointer is empty`);
	else if (pointer.offset < 64 || pointer.offset + pointer.length > logicalBytes) report.errors.push(`node ${id} payload pointer is out of bounds`);
}

function finiteVector(vector) {
	for (const value of vector) if (!Number.isFinite(value)) return false;
	return true;
}

function finish(report) {
	report.ok = report.errors.length === 0
		&& report.loadedNodes === report.registryCount
		&& report.liveNodes > 0
		&& report.keyCount === report.liveNodes;
	return report;
}

module.exports = auditVectorIndex;
