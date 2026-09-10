//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file ragStartupWarmup.js
 * @description
 * The Awtsmoos warms one native publication generation without touching legacy
 * comment mirrors. Awtsmoos.com keeps semantic model warmup independent, so an
 * optional intelligence failure can never counterfeit storage failure.
 */

const { performance } = require('node:perf_hooks');
const { warmImmutableRagCorpus } = require('./immutableRagWarmup.js');
const { startWorker, workerStatus } = require('./multilingualWorkerClient.js');
const {
	CONFIGURATION_FILE,
	REPOSITORY_ROOT,
	configuredRoot,
	rootFromInterface
} = require('./warmupRoot.js');

let startupState = null;
let semanticWarmup = null;

/** Starts the reusable multilingual worker once without coupling it to storage readiness. */
function beginSemanticWarmup() {
	if (process.env.AWTS_RAG_SEMANTIC_WARMUP === '0') return null;
	if (semanticWarmup) return semanticWarmup;
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

/** Proves native corpus readiness and then begins optional semantic model warmup. */
function warmRagCorpus($i = null) {
	if (process.env.AWTS_RAG_STARTUP_WARMUP === '0') {
		return {
			ok: true,
			skipped: true,
			semantic: workerStatus()
		};
	}
	if (startupState) return { ...startupState, semantic: workerStatus() };
	const started = performance.now();
	startupState = {
		...warmImmutableRagCorpus($i),
		elapsedMs: Number((performance.now() - started).toFixed(3))
	};
	beginSemanticWarmup();
	return { ...startupState, semantic: workerStatus() };
}

/** Preserves the historic caller name while warming native publication truth. */
function warmRagCommentSource($i = null) {
	return warmRagCorpus($i);
}

/** Clears only warmup-local state for explicit operator refreshes and tests. */
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
