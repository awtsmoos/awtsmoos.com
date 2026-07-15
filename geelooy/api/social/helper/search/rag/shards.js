// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardDiscovery
 * @chapter Manifest Identity And Live Persisted Readiness Must Agree
 * @description
 * Uses only manifest-backed candidates, then opens each selected shard read-only
 * to verify its real list and HNSW registry before public routing or advertisement.
 */

const { openShardSession } = require('./shardStore.js');
const {
	describeFile,
	shardFiles
} = require('./shardManifest.js');

function rowsOf(list) {
	const plain = list?.__resolve__?.();
	return Array.isArray(plain)
		? plain
		: Array.from(
			{ length: Number(list?.length || 0) },
			(_value, index) => list[index]
		);
}

function inspectSelected(shard) {
	const session = openShardSession(shard);
	const sample = session.list.length
		? session.list[0]
		: null;
	return {
		...shard,
		listName: session.listName,
		count: Number(session.list.length || 0),
		sampleKeys: sample ? Object.keys(sample) : [],
		vectorEnabled: session.status.usable,
		registryCount: session.status.registryCount,
		entryNodeID: session.status.entryNodeID,
		maxLevel: session.status.maxLevel
	};
}

function inspectSafely(shard) {
	try {
		return inspectSelected(shard);
	} catch (error) {
		return {
			...shard,
			error: error.message
		};
	}
}

async function availableShards({ $i }) {
	return shardFiles($i)
		.map(describeFile)
		.map(inspectSafely)
		.sort((left, right) => (
			(right.count || 0) - (left.count || 0)
		));
}

async function resolveShard({ $i, lane }) {
	const shards = shardFiles($i).map(describeFile);
	const requested = String(lane || '').toLowerCase();
	const selected = requested
		? shards.find(shard => matchesLane(shard, requested))
		: shards.sort((left, right) => right.count - left.count)[0];
	return selected ? inspectSelected(selected) : null;
}

function matchesLane(shard, requested) {
	return shard.id === requested
		|| shard.aliases.includes(requested)
		|| shard.id.includes(requested);
}

module.exports = {
	availableShards,
	resolveShard,
	rowsOf
};
