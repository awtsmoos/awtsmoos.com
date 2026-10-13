#!/usr/bin/env node
// B"H

/**
 * @file pack_all_corpora.mjs
 * @description
 * One driver for every BGE corpus in ~/workspace/corpus-embeddings plus the
 * earlier Admur corpus: runs the generic pack_vectors.mjs per corpus with its
 * shard basename, then pack_admur_vectors.mjs for admur. Run AFTER the GPU
 * box produced vectors-<corpus>.jsonl for each corpus.
 *
 *   node pack_all_corpora.mjs [--corpora rambam,bavli] [--admur]
 *
 * Honors the same env as the underlying packers:
 *   CORPUS_JOB_DIR (chunk/vector manifests), AWTS_RAG_DIR (output dir),
 *   ADMUR_JOB_DIR (admur manifests), AWTS_LIVE_WAL (live WAL guard).
 * Then confirm every shard basename is registered in
 * geelooy/api/social/helper/search/rag/canonicalShards.js and restart
 * the search service.
 */

import path from 'path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// corpus name (vectors-<name>.jsonl) -> shard basename, per
// ~/workspace/corpus-embeddings/README.md "Corpora and shards" table.
const CORPORA = Object.freeze([
	['rambam', 'rambam-english-rag'],
	['bavli', 'bavli-english-rag'],
	['yerushalmi', 'yerushalmi-english-rag'],
	['tanach-comm', 'tanach-commentary-english-rag'],
	['tanach-base', 'tanach-english-rag'],
	['mishnah', 'mishnah-english-rag'],
	['midrash', 'midrash-english-rag'],
	['sichos', 'likkutei-sichos-english-rag'],
	['hemshech5666', 'hemshech5666-english-rag']
]);

function parseArgs(argv) {
	const options = { corpora: null, admur: false };
	for (const argument of argv) {
		if (argument.startsWith('--corpora=')) {
			options.corpora = new Set(argument.slice('--corpora='.length).split(',').filter(Boolean));
		} else if (argument === '--admur') {
			options.admur = true;
		} else if (argument === '--help' || argument === '-h') {
			console.log('usage: node pack_all_corpora.mjs [--corpora=rambam,bavli] [--admur]');
			process.exit(0);
		} else {
			console.error(`unknown argument: ${argument}`);
			process.exit(2);
		}
	}
	return options;
}

function runPack(env, script, label) {
	console.log(`B"H packing ${label} via ${script}`);
	const result = spawnSync(process.execPath, [path.join(HERE, script)], {
		env: { ...process.env, ...env },
		stdio: 'inherit'
	});
	if (result.status !== 0) {
		throw new Error(`pack failed for ${label}: exit ${result.status}`);
	}
}

function main() {
	const options = parseArgs(process.argv.slice(2));
	const selected = CORPORA.filter(([name]) => !options.corpora || options.corpora.has(name));
	if (options.corpora) {
		const unknown = [...options.corpora].filter(name => !CORPORA.some(([known]) => known === name));
		if (unknown.length) throw new Error(`unknown corpora: ${unknown.join(', ')}`);
	}
	for (const [name, shard] of selected) {
		runPack({ CORPUS_NAME: name, CORPUS_SHARD: shard }, 'pack_vectors.mjs', `${name} -> ${shard}`);
	}
	if (options.admur) {
		runPack({}, 'pack_admur_vectors.mjs', 'admur -> admur-hazaken-english-rag');
	}
	console.log(`B"H packed ${selected.length} corpora${options.admur ? ' + admur' : ''}.`);
}

main();
