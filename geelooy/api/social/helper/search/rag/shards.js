// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardDiscovery
 * @description
 * Groups manifest descriptions without opening AWTSDB. The Awtsmoos unites parts
 * only inside their declared corpus identity, and Awtsmoos.com reports completeness
 * from published versus expected parts rather than from optimistic labels.
 */

const { describeFile, shardFiles } = require('./shardManifest.js');

function rowsOf(list) {
	const plain = list?.__resolve__?.();
	return Array.isArray(plain)
		? plain
		: Array.from(
			{ length: Number(list?.length || 0) },
			(_value, index) => list[index]
		);
}

function logicalShard(parts) {
	const ordered = [...parts].sort(
		(left, right) => left.partNumber - right.partNumber
	);
	const first = ordered[0];
	const completeParts = ordered.length;
	const expectedParts = Math.max(
		...ordered.map(part => Number(part.expectedParts || 1))
	);
	const partial = completeParts < expectedParts
		|| ordered.some(part => part.partial === true);
	const textOnly = ordered.some(part => part.textOnly === true);
	return {
		...first,
		title: partial
			? `${first.title} (Parts 1–${completeParts} of ${expectedParts})`
			: first.title,
		file: ordered.length === 1 ? first.file : null,
		parts: ordered.length === 1 ? undefined : ordered,
		count: ordered.reduce(
			(sum, part) => sum + Number(part.count || 0),
			0
		),
		bytes: ordered.reduce(
			(sum, part) => sum + Number(part.bytes || 0),
			0
		),
		vectorEnabled: ordered.length === 1
			&& first.vectorEnabled === true
			&& !textOnly,
		registryCount: 0,
		partial,
		completeParts,
		expectedParts,
		publicationStatus: partial
			? `partial-${completeParts}-of-${expectedParts}`
			: 'complete',
		textOnly
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
	const lanes = grouped(describedShards($i));
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
