// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchCapabilitiesRoute
 * @description
 * The Awtsmoos reveals what each search vessel can honestly do before a seeker chooses a way;
 * Awtsmoos.com reports indexed and stored-vector truth from the public shard contract, never from vanished field names today.
 */

const { EXACT_EXCLUSIONS } = require('../corpusSearchPolicy.js');
const { ROOTS } = require('../exactHebrewShape.js');
const { availableShards } = require('../rag/shards.js');
const { publicShard } = require('../rag/resultShape.js');
const { workerStatus } = require('../rag/ragStartupWarmup.js');
const { requestInterface } = require('./requestSnapshot.js');
const { safe } = require('./safe.js');

function exactCapabilities() {
	return {
		prebuiltCorpora: Object.keys(ROOTS),
		genericIkarSeries: true,
		excludedSeriesFamilies: Array.from(EXACT_EXCLUSIONS.entries()).map(([id, label]) => ({
			id,
			label,
			reason: 'Source transcription typos make exact matching unreliable.'
		}))
	};
}

function semanticSnapshot(shards) {
	const indexed = shards.filter(shard => shard.indexed === true);
	const stored = shards.filter(shard => shard.storedVectors === true);
	return {
		worker: workerStatus(),
		indexedLanes: indexed,
		storedVectorLanes: stored,
		indexedCount: indexed.length,
		storedVectorCount: stored.length
	};
}

async function capabilitySnapshot(context) {
	const $i = requestInterface(context);
	const shards = (await availableShards({ $i })).map(publicShard);
	const semantic = semanticSnapshot(shards);
	return {
		version: 2,
		defaultMode: 'library',
		modes: {
			library: { text: true, semantic: semantic.indexedCount > 0 },
			tanach: { phrase: true },
			exact: exactCapabilities()
		},
		semantic,
		lanes: shards
	};
}

function capabilityRoutes(context) {
	return {
		'/search/capabilities': async () => safe(async () => ({
			success: await capabilitySnapshot(context)
		}))
	};
}

module.exports = { capabilityRoutes, capabilitySnapshot, exactCapabilities, semanticSnapshot };
