// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file core/vacuum/vectorRebuilder.js
 * @chapter Vacuum Preserves Compact Geometry While Rebinding Every Payload
 * @description Uses ordinary row reindexing for legacy corpora and a persisted
 * topology snapshot for compact corpora, retaining vectors, levels, neighbors,
 * and strict ranking while assigning destination-owned payload pointers.
 */

const { resolvePath } = require('../../api/vector/pathResolver.js');

function rebuild(source, destination, configuration) {
	const sourceHandle = requireHandle(source, configuration.path, 'source');
	const destinationHandle = requireHandle(
		destination,
		configuration.path,
		'destination'
	);
	if (isCompactCorpus(source, configuration.path)) {
		const snapshot = source.vector.snapshotTopology(sourceHandle);
		const report = destination.vector.cloneDetachedGraph(
			destinationHandle,
			snapshot,
			snapshot.orderedKeys,
			{
				dimensions: configuration.dimensions,
				metric: configuration.metric
			}
		);
		return assertUsable(
			destination,
			destinationHandle,
			configuration.path,
			{
				...report,
				scanned: snapshot.nodes.length,
				indexed: snapshot.nodes.length,
				detached: true
			}
		);
	}
	destination.vector.enable(destinationHandle, {
		dimensions: configuration.dimensions,
		metric: configuration.metric
	});
	const report = destination.vector.lastReindexReport(destinationHandle);
	return assertUsable(
		destination,
		destinationHandle,
		configuration.path,
		report
	);
}

function isCompactCorpus(database, path) {
	const manifest = materialize(database.root.__vector_corpus__);
	return Boolean(
		manifest?.format === 'awtsmoos-compact-vector-corpus'
		&& String(manifest.listName) === String(path)
		&& manifest.vectorsStoredInPayloads === false
	);
}

function assertUsable(database, handle, path, report) {
	const status = database.vector.indexStatus(handle);
	if (!report || !status.usable) {
		const error = new Error(
			`B"H derived vector rebuild produced an unusable graph: ${path}`
		);
		error.code = 'AWTSMOOS_DB_VACUUM_INDEX_REBUILD_FAILED';
		error.details = {
			report,
			status: publicStatus(status)
		};
		throw error;
	}
	return {
		...report,
		status: publicStatus(status)
	};
}

function requireHandle(database, path, kind) {
	const handle = resolvePath(database, path);
	if (handle) return handle;
	const error = new Error(`B"H ${kind} vector path missing: ${path}`);
	error.code = 'AWTSMOOS_DB_VACUUM_INDEX_REBUILD_FAILED';
	throw error;
}

function materialize(value) {
	if (!value) return value;
	try {
		return value.__resolve__?.() ?? value;
	} catch {
		return value;
	}
}

function publicStatus(status) {
	return {
		path: status.path,
		configured: status.configured,
		registryCount: status.registryCount,
		entryNodeID: status.entryNodeID,
		usable: status.usable
	};
}

module.exports = {
	rebuild
};
