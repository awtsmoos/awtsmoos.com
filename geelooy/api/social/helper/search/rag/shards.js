// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardDiscovery
 * @description
 * Public discovery reads manifests only. A database opens only after one exact lane
 * is selected, so listing cannot awaken the whole library.
 */

const { catalog } = require('./shardCatalog.js');
const { openShardSession } = require('./shardStore.js');

function rowsOf(list) {
	const plain = list?.__resolve__?.();
	return Array.isArray(plain)
		? plain
		: Array.from(
			{ length: Number(list?.length || 0) },
			(_, index) => list[index]
		);
}

async function availableShards({ $i }) {
	return catalog($i);
}

async function resolveShard({ $i, lane }) {
	const shards = catalog($i);
	const requested = String(lane || '').trim().toLowerCase();
	const selected = requested
		? shards.find(shard => matches(shard, requested))
		: defaultShard(shards);
	if (!selected) return null;
	if (selected.listName) return selected;
	return inspectSelected(selected);
}

function defaultShard(shards) {
	return [...shards].sort((left, right) => {
		const textDifference = Number(Boolean(right.textFile))
			- Number(Boolean(left.textFile));
		return textDifference || right.count - left.count;
	})[0] || null;
}

function matches(shard, requested) {
	return shard.id === requested
		|| shard.aliases.includes(requested)
		|| shard.id.includes(requested);
}

function inspectSelected(shard) {
	const session = openShardSession(shard);
	const sample = session.list.length ? session.list[0] : null;
	return {
		...shard,
		listName: session.listName,
		count: Number(session.list.length || 0),
		sampleKeys: sample ? Object.keys(sample) : [],
		vectorEnabled: session.status.usable
	};
}

module.exports = {
	availableShards,
	resolveShard,
	rowsOf
};
