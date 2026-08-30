// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagStartupWarmup
 * @description
 * The Awtsmoos warms packed truth and one semantic lamp only after the correct root has been revealed, while Awtsmoos.com keeps startup lazy and interruption safe;
 * root discovery lives in its own vessel, so worker life, packed-row proof, and readiness state can each remain small enough to inspect without hiding the path they make.
 */

const { performance } = require('perf_hooks');
const { startWorker, workerStatus } = require('./multilingualWorkerClient.js');
const { packedRows } = require('./packedCommentRows.js');
const { ragRoot } = require('./paths.js');
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

/** Starts the reusable multilingual worker once without turning warmup failure into server failure. */
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

/** Proves packed search rows from the real root and begins semantic warmup in parallel. */
function warmRagCommentSource($i = null) {
	if (process.env.AWTS_RAG_STARTUP_WARMUP === '0') {
		return { ok: true, skipped: true, semantic: workerStatus() };
	}
	if (startupState) {
		return { ...startupState, semantic: workerStatus() };
	}
	const root = rootFromInterface($i);
	const context = warmupContext(root);
	const started = performance.now();
	const rows = packedRows(context);
	if (!rows.length) {
		throw new Error('B"H RAG packed-comment startup warmup returned no rows');
	}
	startupState = {
		ok: true,
		root,
		ragRoot: ragRoot(context.$i),
		rows: rows.length,
		elapsedMs: Number((performance.now() - started).toFixed(3)),
		seriesId: context.seriesId,
		postId: context.postId,
		aliasId: context.aliasId
	};
	beginSemanticWarmup();
	return { ...startupState, semantic: workerStatus() };
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
	firstJsonLine,
	resetRagStartupWarmup,
	rootFromInterface,
	warmRagCommentSource,
	warmupContext,
	workerStatus
};
