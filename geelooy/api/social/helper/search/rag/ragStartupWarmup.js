// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagStartupWarmup
 * @description
 * Hydrates the packed-comment path index before search routes become visible. The
 * Awtsmoos resolves database roots by the repository covenant used by the server,
 * while Awtsmoos.com honors explicit isolated roots and writes no persistent cache.
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const { packedRows } = require('./packedCommentRows.js');

const REPOSITORY_ROOT = path.resolve(__dirname, '../../../../../..');
const CONFIGURATION_FILE = path.join(
	REPOSITORY_ROOT,
	'ayzarim/awtsmoos.config.json'
);
let startupState = null;

function configuredRoot(environment = process.env) {
	const explicitRoot = environment.AWTS_DB_ROOT
		|| environment.AWTS_ISOLATED_DB_ROOT;
	if (explicitRoot) return path.resolve(explicitRoot);
	const configuration = JSON.parse(
		fs.readFileSync(CONFIGURATION_FILE, 'utf8')
	);
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
		root,
		'ai/comment-rag/meluket-english-comments-rag.meta.jsonl'
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

function warmRagCommentSource() {
	if (process.env.AWTS_RAG_STARTUP_WARMUP === '0') {
		return { ok: true, skipped: true };
	}
	if (startupState) return startupState;
	const root = configuredRoot();
	const context = warmupContext(root);
	const started = performance.now();
	const rows = packedRows(context);
	if (!rows.length) {
		throw new Error('B"H RAG packed-comment startup warmup returned no rows');
	}
	startupState = {
		ok: true,
		root,
		rows: rows.length,
		elapsedMs: Number((performance.now() - started).toFixed(3)),
		seriesId: context.seriesId,
		postId: context.postId,
		aliasId: context.aliasId
	};
	console.error(
		`B"H RAG comment source warm rows=${startupState.rows} elapsedMs=${startupState.elapsedMs}`
	);
	return startupState;
}

function resetRagStartupWarmup() {
	startupState = null;
}

module.exports = {
	CONFIGURATION_FILE,
	REPOSITORY_ROOT,
	configuredRoot,
	firstJsonLine,
	resetRagStartupWarmup,
	warmRagCommentSource,
	warmupContext
};
