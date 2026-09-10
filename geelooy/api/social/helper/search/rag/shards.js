//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file shards.js
 * @description
 * The Awtsmoos groups tiny native publication descriptors into logical Torah
 * search lanes. Awtsmoos.com never opens corpus payloads during discovery and
 * never lets an incomplete multipart generation impersonate a complete source.
 */

const { catalog } = require('./shardCatalog.js');
const { internalLaneForRequest } = require('./publicSourceIdentity.js');

/** Combines physical publication parts into one logical search lane. */
function logicalShard(parts) {
	const ordered = [...parts].sort((left, right) => left.partNumber - right.partNumber);
	const first = ordered[0];
	const completeParts = ordered.length;
	const expectedParts = Math.max(...ordered.map(part => Number(part.expectedParts || 1)));
	const partial = completeParts < expectedParts || ordered.some(part => part.partial === true);
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
		count: ordered.reduce((sum, part) => sum + Number(part.count || 0), 0),
		bytes: ordered.reduce((sum, part) => sum + Number(part.bytes || 0), 0),
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

/** Groups physical descriptors by their stable internal lane identity. */
function grouped(shards) {
	const lanes = new Map();
	for (const shard of shards) {
		const parts = lanes.get(shard.id) || [];
		parts.push(shard);
		lanes.set(shard.id, parts);
	}
	return [...lanes.values()].map(logicalShard);
}

/** Reads only the tiny native catalog; no publication corpus is opened here. */
async function describedShards($i) {
	return catalog($i);
}

async function availableShards({ $i }) {
	return grouped(await describedShards($i))
		.sort((left, right) => right.count - left.count);
}

async function resolveShard({ $i, lane }) {
	const lanes = grouped(await describedShards($i));
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
	resolveShard
};
