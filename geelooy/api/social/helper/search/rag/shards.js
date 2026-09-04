// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardDiscovery
 * @description
 * The Awtsmoos unites reviewed multipart corpora without extinguishing the vector light inside each physical shard;
 * Awtsmoos.com resolves neutral public names into exact internal vessels while incomplete publications remain barred.
 */

const { describeFile, shardFiles } = require('./shardManifest.js');
const { internalLaneForRequest } = require('./publicSourceIdentity.js');

/** Resolves an Awtsmoos list vessel into an ordinary array without mutating it. */
function rowsOf(list) {
	const plain = list?.__resolve__?.();
	if (Array.isArray(plain)) return plain;
	const length = Number(list?.length || 0);
	return Array.from(
		{ length },
		(_value, index) => list[index]
	);
}

/** Combines physical publication parts into one logical search lane. */
function logicalShard(parts) {
	const ordered = [...parts]
		.sort((left, right) => left.partNumber - right.partNumber);
	const first = ordered[0];
	const completeParts = ordered.length;
	const expectedParts = Math.max(
		...ordered.map(part => Number(part.expectedParts || 1))
	);
	const partial = completeParts < expectedParts
		|| ordered.some(part => part.partial === true);
	const textOnly = ordered.some(part => part.textOnly === true);
	const everyPartVector = ordered.every(part => part.vectorEnabled === true);
	const vectorEnabled = !partial && !textOnly && everyPartVector;
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
		dimensions: Number(first.dimensions || 0),
		vectorEnabled,
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

/** Groups physical shard descriptions by their internal lane identity. */
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
	const requested = internalLaneForRequest(lane);
	if (!requested) return lanes[0] || null;
	return lanes.find(shard => matchesLane(shard, requested)) || null;
}

function matchesLane(shard, requestedValue) {
	const requested = internalLaneForRequest(requestedValue);
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
