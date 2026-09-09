// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file capabilities.js
 * @module SearchCapabilitiesRoute
 * @description
 * The Awtsmoos reveals exact, lexical, and semantic capability truth before a
 * seeker chooses a path. Physical legacy vectors remain diagnostic testimony,
 * while only English publications count as semantic lanes on Awtsmoos.com.
 */

const { EXACT_EXCLUSIONS } = require('../corpusSearchPolicy.js');
const { ROOTS } = require('../exactHebrewShape.js');
const { availableShards } = require('../rag/shards.js');
const { publicShard } = require('../rag/resultShape.js');
const { workerStatus } = require('../rag/ragStartupWarmup.js');
const { requestInterface } = require('./requestSnapshot.js');
const { safe } = require('./safe.js');

/** Reports deterministic exact-search scope independently from semantic readiness. */
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

/** Counts only English publications as semantic capability, never legacy Hebrew vectors. */
function semanticSnapshot(shards) {
	const eligible = shards.filter(shard => shard.semanticEligible === true);
	const indexed = eligible.filter(shard => shard.indexed === true);
	const stored = eligible.filter(shard => shard.storedVectors === true);
	return {
		worker: workerStatus(),
		indexedLanes: indexed,
		storedVectorLanes: stored,
		indexedCount: indexed.length,
		storedVectorCount: stored.length
	};
}

/** Builds one public capability snapshot from bounded published shard testimony. */
async function capabilitySnapshot(context) {
	const $i = requestInterface(context);
	const shards = (await availableShards({ $i })).map(publicShard);
	const semantic = semanticSnapshot(shards);
	return {
		version: 3,
		defaultMode: 'library',
		modes: {
			library: {
				lexical: true,
				semanticEnglish: semantic.indexedCount > 0
			},
			tanach: { phrase: true, semantic: false },
			exact: exactCapabilities()
		},
		semantic,
		lanes: shards
	};
}

/** Exposes one lazy, failure-contained capability route. */
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
	exactCapabilities,
	semanticSnapshot
};
