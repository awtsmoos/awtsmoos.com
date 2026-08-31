// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagStartupWarmup
 * @description
 * The Awtsmoos warms immutable semantic truth before any optional comment chamber, while Awtsmoos.com keeps corpus readiness and hydration free to shine apart;
 * one measured publication proves the vessel, one reusable multilingual worker kindles search, and neither must counterfeit the other's part.
 */

const { performance } = require('perf_hooks');
const { warmImmutableRagCorpus } = require('./immutableRagWarmup.js');
const { startWorker, workerStatus } = require('./multilingualWorkerClient.js');
const {
	CONFIGURATION_FILE,
	REPOSITORY_ROOT,
	configuredRoot,
	firstJsonLine,
	rootFromInterface,
	warmupContext
} = require('./warmupRoot.js');

let startupState = null;
let semanticWarmup = null;

/** Starts the reusable multilingual worker once without turning model warmup failure into storage failure. */
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

/** Proves immutable corpus geometry from the real request root and begins semantic model warmup independently. */
function warmRagCorpus($i = null) {
	if (process.env.AWTS_RAG_STARTUP_WARMUP === '0') {
		return {
			ok: true,
			skipped: true,
			semantic: workerStatus()
		};
	}
	if (startupState) {
		return { ...startupState, semantic: workerStatus() };
	}
	const started = performance.now();
	startupState = {
		...warmImmutableRagCorpus($i),
		elapsedMs: Number((performance.now() - started).toFixed(3))
	};
	beginSemanticWarmup();
	return { ...startupState, semantic: workerStatus() };
}

/** Preserves the historic caller name while deliberately warming corpus storage rather than comment hydration. */
function warmRagCommentSource($i = null) {
	return warmRagCorpus($i);
}

/** Clears only warmup-local state so tests and explicit operator refreshes can start from current truth. */
function resetRagStartupWarmup() {
	startupState = null;
	semanticWarmup = null;
}

module.exports = {
	CONFIGURATION_FILE,
	REPOSITORY_ROOT,
	beginSemanticWarmup,
	configuredRoot,
	firstJsonLine,
	resetRagStartupWarmup,
	rootFromInterface,
	warmRagCommentSource,
	warmRagCorpus,
	warmupContext,
	workerStatus
};
