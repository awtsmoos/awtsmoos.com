// B"H

/**
 * @file api/vector/audit.js
 * @chapter Every Node, Neighbor, Vector, Key, And Payload Seal Is Counted
 * @description
 * Performs an exhaustive structural audit of a persisted HNSW graph without
 * exact-scanning the source records or accepting manager fallback behavior.
 */

const SmartPointer = require('../../utils/smartPointer.js');

function auditVectorIndex(manager, handleOrPath) {
	const status = manager.indexStatus(handleOrPath);
	const report = {
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
		errors: []
	};
	if (!status.usable) {
		report.errors.push('index is not usable');
		return finish(report);
	}

	for (let id = 0; id < status.registryCount; id++) {
		inspectNode(status.index, id, report, manager.db.allocator.cursor);
	}
	inspectKeyMap(status.index, report);
	if (report.entryNodeID < 0 || report.entryNodeID >= report.registryCount) {
		report.errors.push(`entry node is out of range: ${report.entryNodeID}`);
	}
	return finish(report);
}

function inspectNode(index, id, report, logicalBytes) {
	const node = index.registry.getNode(id);
	if (!node) {
		report.errors.push(`node ${id} could not be loaded`);
		return;
	}
	report.loadedNodes++;
	if (node.id !== id) report.errors.push(`node id mismatch ${id}->${node.id}`);
	if (!(node.vector instanceof Float32Array)) report.errors.push(`node ${id} vector is not Float32Array`);
	else if (report.dimensions && node.vector.length !== report.dimensions) report.errors.push(`node ${id} has ${node.vector.length} dimensions`);
	else if (!finiteVector(node.vector)) report.errors.push(`node ${id} contains non-finite coordinates`);
	if (node.deleted) report.deletedNodes++;
	else report.liveNodes++;
	inspectPayload(node, id, report, logicalBytes);
	for (const neighbors of node.neighbors || []) {
		for (const neighborId of neighbors || []) {
			report.neighborEdges++;
			if (!Number.isInteger(neighborId) || neighborId < 0 || neighborId >= report.registryCount) {
				report.errors.push(`node ${id} has invalid neighbor ${neighborId}`);
			}
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
	else if (pointer.offset < 64 || pointer.offset + pointer.length > logicalBytes) {
		report.errors.push(`node ${id} payload pointer is out of bounds`);
	}
}

function inspectKeyMap(index, report) {
	let resolved;
	try { resolved = index.keyMap?.__resolve__?.(); }
	catch (error) { report.errors.push(`key map resolve failed: ${error.message}`); return; }
	if (!(resolved instanceof Map)) {
		report.errors.push('key map did not resolve to Map');
		return;
	}
	report.keyCount = resolved.size;
	for (const [key, id] of resolved.entries()) {
		if (!Number.isInteger(id) || id < 0 || id >= report.registryCount) report.errors.push(`key ${key} points to invalid node ${id}`);
	}
}

function finiteVector(vector) { for (const value of vector) if (!Number.isFinite(value)) return false; return true; }
function finish(report) { report.ok = report.errors.length === 0 && report.loadedNodes === report.registryCount && report.liveNodes > 0 && report.keyCount > 0; return report; }

module.exports = auditVectorIndex;
