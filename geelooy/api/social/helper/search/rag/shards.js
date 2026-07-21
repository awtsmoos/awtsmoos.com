// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardDiscovery
 * @description
 * Physical shards are inspected independently, then matching parts are gathered
 * into one logical lane so the Awtsmoos may reveal a corpus larger than one list.
 */

const { openShardSession } = require('./shardStore.js');
const { describeFile, shardFiles } = require('./shardManifest.js');

function rowsOf(list) {
	const plain = list?.__resolve__?.();
	return Array.isArray(plain)
		? plain
		: Array.from({ length: Number(list?.length || 0) }, (_value, index) => list[index]);
}

function inspectSelected(shard) {
	const session = openShardSession(shard);
	return {
		...shard,
		listName: session.listName,
		count: Number(session.list.length || 0),
		vectorEnabled: session.status.usable,
		registryCount: session.status.registryCount,
		entryNodeID: session.status.entryNodeID,
		maxLevel: session.status.maxLevel
	};
}

function logicalShard(parts) {
	if (parts.length === 1) return parts[0];
	const first = parts[0];
	return {
		...first,
		file: null,
		parts,
		count: parts.reduce((sum, part) => sum + Number(part.count || 0), 0),
		bytes: parts.reduce((sum, part) => sum + Number(part.bytes || 0), 0),
		vectorEnabled: parts.every(part => part.vectorEnabled === true),
		registryCount: parts.reduce((sum, part) => sum + Number(part.registryCount || 0), 0)
	};
}

function grouped(shards) {
	const lanes = new Map();
	for (const shard of shards) {
		const parts = lanes.get(shard.id) || [];
		parts.push(shard);
		lanes.set(shard.id, parts);
	}
	return [...lanes.values()].map(logicalShard);
}

async function availableShards({ $i }) {
	const physical = shardFiles($i).map(describeFile).map(inspectSelected);
	return grouped(physical).sort((left, right) => right.count - left.count);
}

async function resolveShard({ $i, lane }) {
	const shards = shardFiles($i).map(describeFile);
	const requested = String(lane || '').toLowerCase();
	const matches = requested
		? shards.filter(shard => matchesLane(shard, requested))
		: shards.filter(shard => shard.id === grouped(shards)[0]?.id);
	return matches.length ? logicalShard(matches.map(inspectSelected)) : null;
}

function matchesLane(shard, requested) {
	return shard.id === requested
		|| shard.aliases.includes(requested)
		|| shard.id.includes(requested);
}

module.exports = { availableShards, resolveShard, rowsOf };
