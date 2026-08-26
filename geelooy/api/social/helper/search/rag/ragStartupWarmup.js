// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagStartupWarmup
 * @description
 * The Awtsmoos warms both packed comments and the multilingual semantic lamp before seekers arrive;
 * Awtsmoos.com keeps startup bounded, while one persistent model remains awake for every later drive.
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const { warmMultilingualWorker } = require('./multilingualEmbedder.js');
const { packedRows } = require('./packedCommentRows.js');
const { ragRoot } = require('./paths.js');

const REPOSITORY_ROOT = path.resolve(__dirname, '../../../../../..');
const CONFIGURATION_FILE = path.join(REPOSITORY_ROOT, 'ayzarim/awtsmoos.config.json');
let startupState = null;
let semanticWarmup = null;

function configuredRoot(environment = process.env) {
	const explicitRoot = environment.AWTS_DB_ROOT || environment.AWTS_ISOLATED_DB_ROOT;
	if (explicitRoot) return path.resolve(explicitRoot);
	const configuration = JSON.parse(fs.readFileSync(CONFIGURATION_FILE, 'utf8'));
	return path.resolve(REPOSITORY_ROOT, configuration.dbPath);
}

function firstJsonLine(file) {
	const descriptor = fs.openSync(file, 'r');
	try {
		const buffer = Buffer.alloc(256 * 1024);
		const bytes = fs.readSync(descriptor, buffer, 0, buffer.length, 0);
		const text = buffer.subarray(0, bytes).toString('utf8');
		const line = text.split('\n').find(value => value.trim());
		if (!line) throw new Error(`B"H metadata mirror is empty: ${file}`);
		return JSON.parse(line);
	} finally {
		fs.closeSync(descriptor);
	}
}

function warmupContext(root) {
	const metadata = path.join(
		ragRoot({ db: { directory: root } }),
		'meluket-english-comments-rag.meta.jsonl'
	);
	const row = firstJsonLine(metadata);
	return {
		$i: { db: { directory: root } },
		heichelId: row.heichelId || 'ikar',
		seriesId: row.seriesId,
		postId: row.postId,
		aliasId: row.aliasId
	};
}

function beginSemanticWarmup() {
	if (process.env.AWTS_RAG_SEMANTIC_WARMUP === '0') return null;
	if (semanticWarmup) return semanticWarmup;
	semanticWarmup = warmMultilingualWorker()
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

function warmRagCommentSource() {
	if (process.env.AWTS_RAG_STARTUP_WARMUP === '0') {
		beginSemanticWarmup();
		return { ok: true, skipped: true };
	}
	if (startupState) return startupState;
	const root = configuredRoot();
	const context = warmupContext(root);
	const started = performance.now();
	const rows = packedRows(context);
	if (!rows.length) throw new Error('B"H RAG packed-comment startup warmup returned no rows');
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
	console.error(`B"H RAG comment source warm rows=${startupState.rows} elapsedMs=${startupState.elapsedMs}`);
	return startupState;
}

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
	warmRagCommentSource,
	warmupContext
};
