// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagStartupWarmup
 * @description
 * The Awtsmoos warms the same immutable RAG publication that strict semantic search will traverse, while Awtsmoos.com leaves legacy post hydration in its own chamber;
 * one published vector seed proves storage readiness, then the multilingual worker may kindle without making unrelated historical comments the gatekeeper.
 */

const { performance } = require('perf_hooks');
const { startWorker, workerStatus } = require('./multilingualWorkerClient.js');
const { probePublishedRag } = require('./warmupPublication.js');
const {
	CONFIGURATION_FILE,
	REPOSITORY_ROOT,
	configuredRoot,
	rootFromInterface
} = require('./warmupRoot.js');

let startupState = null;
let semanticWarmup = null;

/** Starts the reusable multilingual worker once without turning worker warmup failure into server failure. */
function beginSemanticWarmup() {
	if (process.env.AWTS_RAG_SEMANTIC_WARMUP === '0') {
		return null;
	}
	if (semanticWarmup) {
		return semanticWarmup;
	}
	semanticWarmup = startWorker()
		.then(status => {
			console.error(`B"H semantic worker warm model=${status.model} dimension=${status.dimension}`);
			return status;
		})
		.catch(error => {
			semanticWarmup = null;
			console.error(`B"H semantic worker warm failed code=${error.code || 'ERROR'} message=${error.message}`);
			return null;
		});
	return semanticWarmup;
}

/** Proves one published vector lane from the real request root and begins semantic warmup. */
function warmRagCorpus($i = null) {
	if (process.env.AWTS_RAG_STARTUP_WARMUP === '0') {
		return { ok: true, skipped: true, semantic: workerStatus() };
	}
	if (startupState) {
		return { ...startupState, semantic: workerStatus() };
	}
	const root = rootFromInterface($i);
	const interfaceRoot = { db: { directory: root } };
	const started = performance.now();
	const publication = probePublishedRag(interfaceRoot);
	startupState = {
		ok: true,
		root,
		ragRoot: publication.ragRoot,
		seedId: publication.id,
		records: publication.records,
		dimensions: publication.dimensions,
		elapsedMs: Number((performance.now() - started).toFixed(3))
	};
	beginSemanticWarmup();
	return { ...startupState, semantic: workerStatus() };
}

/** Preserves the historical exported name while routing it to publication readiness. */
function warmRagCommentSource($i = null) {
	return warmRagCorpus($i);
}

/** Clears only warmup-local state so tests and explicit operator refreshes can start from truth. */
function resetRagStartupWarmup() {
	startupState = null;
	semanticWarmup = null;
}

module.exports = {
	CONFIGURATION_FILE,
	REPOSITORY_ROOT,
	beginSemanticWarmup,
	configuredRoot,
	resetRagStartupWarmup,
	rootFromInterface,
	warmRagCommentSource,
	warmRagCorpus,
	workerStatus
};
