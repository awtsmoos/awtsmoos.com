// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardDiscovery
 * @description
 * Manifest descriptions are grouped without opening AWTSDB. Text search can then
 * stream sidecars safely, while explicit vector code remains responsible for
 * opening only a supported non-partial shard at the moment it is requested.
 */

const { describeFile, shardFiles } = require('./shardManifest.js');

function rowsOf(list) {
	const plain = list?.__resolve__?.();
	return Array.isArray(plain)
		? plain
		: Array.from({ length: Number(list?.length || 0) }, (_value, index) => list[index]);
}

function logicalShard(parts) {
	const ordered = [...parts].sort((left, right) => left.partNumber - right.partNumber);
	if (ordered.length === 1) return ordered[0];
	const first = ordered[0];
	const completeParts = ordered.length;
	const expectedParts = Math.max(...ordered.map(part => Number(part.expectedParts || 1)));
	const partial = ordered.some(part => part.partial === true);
	return {
		...first,
		title: partial
			? `${first.title} (Parts 1–${completeParts} of ${expectedParts})`
			: first.title,
		file: null,
		parts: ordered,
		count: ordered.reduce((sum, part) => sum + Number(part.count || 0), 0),
		bytes: ordered.reduce((sum, part) => sum + Number(part.bytes || 0), 0),
		vectorEnabled: false,
		registryCount: 0,
		partial,
		completeParts,
		expectedParts,
		publicationStatus: partial ? `partial-${completeParts}-of-${expectedParts}` : 'complete',
		textOnly: partial
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

function describedShards($i) {
	return shardFiles($i).map(describeFile);
}

async function availableShards({ $i }) {
	return grouped(describedShards($i))
		.sort((left, right) => right.count - left.count);
}

async function resolveShard({ $i, lane }) {
	const shards = describedShards($i);
	const lanes = grouped(shards);
	const requested = String(lane || '').toLowerCase();
	if (!requested) return lanes[0] || null;
	return lanes.find(shard => matchesLane(shard, requested)) || null;
}

function matchesLane(shard, requested) {
	return shard.id === requested
		|| shard.aliases.includes(requested)
		|| shard.id.includes(requested);
}

module.exports = {
	availableShards,
	describedShards,
	grouped,
	logicalShard,
	matchesLane,
	resolveShard,
	rowsOf
};
