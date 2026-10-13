#!/usr/bin/env node
// B"H

/**
 * @file test_bge_shard_load.mjs
 * @description
 * Synthetic load-path proof for the BGE search wiring: pack -> register ->
 * load -> flatMatrixSearch, without real embeddings. Exercises the exact
 * production code path (shardManifest.describeFile, canonicalShards
 * registration, queryEmbedder routing, sourceSearch.searchShard) against
 * fake 384-dim vectors packed by pack_vectors.mjs / pack_admur_vectors.mjs.
 *
 *   TEST_JOB_DIR=/tmp/bge-test AWTSMOOS_RAG_ROOT=/tmp/bge-test/rag-out \
 *     node scripts/comment_rag/test_bge_shard_load.mjs
 *
 * Exits non-zero on the first failed assertion.
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const RAG = path.join(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const { describeFile } = require(path.join(RAG, 'geelooy/api/social/helper/search/rag/shardManifest.js'));
const { isCanonicalShardFile } = require(path.join(RAG, 'geelooy/api/social/helper/search/rag/canonicalShards.js'));
const { embedderFor } = require(path.join(RAG, 'geelooy/api/social/helper/search/rag/queryEmbedder.js'));
const { searchShard } = require(path.join(RAG, 'geelooy/api/social/helper/search/rag/sourceSearch.js'));
const { requiresLexicalSearch, queryLanguage } = require(path.join(RAG, 'geelooy/api/social/helper/search/rag/queryLanguagePolicy.js'));

const JOB = process.env.TEST_JOB_DIR || '/tmp/bge-test';
const ROOT = process.env.AWTSMOOS_RAG_ROOT || path.join(JOB, 'rag-out');

const SHARDS = [
	{ file: 'rambam-english-rag.awtsdb', vectors: 'vectors-rambam.jsonl', rows: 50 },
	{ file: 'bavli-english-rag.awtsdb', vectors: 'vectors-bavli.jsonl', rows: 50 },
	{ file: 'admur-hazaken-english-rag.awtsdb', vectors: 'vectors.jsonl', rows: 40 }
];

function loadVectors(name) {
	return fs.readFileSync(path.join(JOB, name), 'utf8')
		.split('\n')
		.filter(Boolean)
		.map(line => JSON.parse(line));
}

function dot(a, b) {
	let sum = 0;
	for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
	return sum;
}

async function testShard(spec) {
	const file = path.join(ROOT, spec.file);
	assert.ok(fs.existsSync(file), `shard file exists: ${spec.file}`);
	const shard = describeFile(file);
	console.log(`-- ${spec.file}: id=${shard.id} count=${shard.count} indexType=${shard.indexType} model=${shard.embeddingModel}`);

	// 1. Manifest covenant written by the packer.
	assert.equal(shard.embeddingModel, 'bge-small-en-v1.5', 'manifest declares bge model');
	assert.equal(shard.indexType, 'flat-f32', 'manifest declares flat exact lane');
	assert.equal(shard.dimensions, 384, 'dimensions 384');
	assert.equal(shard.count, spec.rows, 'row count matches packed rows');
	assert.ok(shard.matrixFile && fs.existsSync(shard.matrixFile), '.f32 exists');
	assert.ok(shard.textFile && fs.existsSync(shard.textFile), '.meta.jsonl exists');

	// 2. Registration: search would discover this shard on a real deploy.
	assert.equal(isCanonicalShardFile(spec.file), true, 'shard is canonical');

	// 3. Query-side routing: bge shard -> bge embedder (never the e5 worker).
	assert.equal(embedderFor(shard), 'bge', 'query router picks bge embedder');

	// 4. Load + search: exact query vector must return its own chunk at rank 1.
	const rows = loadVectors(spec.vectors);
	assert.equal(rows.length, spec.rows, 'synthetic row count');
	const probes = [3, 17, spec.rows - 1];
	for (const probe of probes) {
		const target = rows[probe];
		const t0 = Date.now();
		const result = await searchShard(shard, target.vec, 5);
		const ms = Date.now() - t0;
		assert.equal(result.hits.length, 5, 'top-5 returned');
		assert.equal(result.hits[0].row.id, target.id, `rank-1 is chunk ${target.id}`);
		assert.equal(result.hits[0].row.vectorDimensions, 384, 'public row keeps dimension seal');
		assert.ok(!('vec' in result.hits[0].row), 'public row carries no vector');
		assert.equal(result.hits[0].row.previewEnglish, target.previewEnglish, 'metadata aligned to matrix row');
		assert.ok(result.source.includes('f32-exact-cosine'), `flat exact source: ${result.source}`);
		console.log(`   probe chunk-${String(probe).padStart(2, '0')}: rank-1 exact (${ms}ms), sim=${dot(target.vec, target.vec).toFixed(3)}`);
	}

	// 5. Negative control: an unrelated random vector still ranks the nearest
	//    row first (deterministic cosine order), never crashes, stays bounded.
	const randomVec = rows[0].vec.map(() => Math.random() * 2 - 1);
	const negative = await searchShard(shard, randomVec, 5);
	assert.equal(negative.hits.length, 5, 'negative control bounded');
	console.log(`   negative control: top=${negative.hits[0].row.id} ok`);
}

async function main() {
	for (const spec of SHARDS) await testShard(spec);
	// 6. Hebrew covenant untouched: Hebrew-script queries stay lexical.
	assert.equal(requiresLexicalSearch('בראשית ברא'), true, 'hebrew stays lexical');
	assert.equal(requiresLexicalSearch('שבת'), true, 'hebrew stays lexical');
	assert.equal(requiresLexicalSearch('laws of blessings'), false, 'english routes semantic');
	assert.equal(queryLanguage('hello'), 'english-or-neutral', 'english lane label');
	console.log('B"H all BGE load-path assertions passed.');
}

main().catch(error => {
	console.error('BGE load-path test FAILED:', error.stack || error);
	process.exit(1);
});
