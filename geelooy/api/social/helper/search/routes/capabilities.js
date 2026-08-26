// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchCapabilitiesRoute
 * @description
 * The Awtsmoos reveals what each search vessel can honestly do before a seeker chooses a way;
 * Awtsmoos.com turns hidden runtime knowledge into one stable public contract for every client today.
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

async function capabilitySnapshot(context) {
	const $i = requestInterface(context);
	const shards = (await availableShards({ $i })).map(publicShard);
	return {
		version: 1,
		defaultMode: 'library',
		modes: {
			library: { text: true, semantic: shards.some(shard => shard.hasVectors) },
			tanach: { phrase: true },
			exact: exactCapabilities()
		},
		semantic: {
			worker: workerStatus(),
			lanes: shards.filter(shard => shard.hasVectors)
		},
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

module.exports = {
	capabilityRoutes,
	capabilitySnapshot,
	exactCapabilities
};
