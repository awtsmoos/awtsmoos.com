#!/usr/bin/env node
// B"H
/**
 * @file pack_embed_job.mjs
 * @description
 * Generic packer for embed-jobs corpora. Takes a joined vectors file
 * (from join_vectors.py) and produces the .awtsdb shard + .f32 matrix +
 * .meta.jsonl sidecar that flatMatrixSearch.js consumes.
 *
 * Usage:
 *   node pack_embed_job.mjs --job jobs/tanach --lang en
 *   node pack_embed_job.mjs --job jobs/tanach --lang he
 *
 * Reads jobs/<corpus>/job.json for shard name + dimensions, and
 * jobs/<corpus>/vectors_joined_<lang>.jsonl for rows.
 *
 * Env:
 *   AWTS_RAG_DIR  production RAG dir (default: <job>/rag-out for staging)
 */

import fs from 'fs';
import path from 'path';
import { runVectorPack } from './lib/vector_pack_runtime.mjs';

const args = process.argv.slice(2);
function arg(name) {
	const i = args.indexOf(name);
	return i >= 0 ? args[i + 1] : null;
}
const JOBDIR = arg('--job');
const LANG = arg('--lang') || 'en';
if (!JOBDIR) { console.error('need --job <dir>'); process.exit(2); }

const job = JSON.parse(fs.readFileSync(path.join(JOBDIR, 'job.json'), 'utf8'));
const spec = job.jobs[LANG];
if (!spec) { console.error('no job spec for lang ' + LANG); process.exit(2); }
const DIMENSIONS = spec.dimensions;
const SHARD_BASENAME = spec.shard.replace(/\.awtsdb$/, '');
const RAG = process.env.AWTS_RAG_DIR || path.join(JOBDIR, 'rag-out');

function validate(row, index) {
	if (!row.id || row.realEmbedding !== true) throw new Error(`bad vector ${index}`);
	if (row.dimensions !== DIMENSIONS) throw new Error(`bad dimensions ${index}`);
	if (!Array.isArray(row.vec) || row.vec.length !== DIMENSIONS) throw new Error(`bad vec ${index}`);
	for (const key of ['corpus', 'postId', 'embeddingText']) {
		if (row[key] == null) throw new Error(`missing ${key} on ${row.id}`);
	}
}

function packRecord(row) {
	return {
		id: row.id,
		corpus: row.corpus,
		lang: row.lang,
		postId: row.postId,
		heichelId: row.heichelId,
		seriesId: row.seriesId,
		title: row.title,
		embeddingText: row.embeddingText,
		meta: row.meta,
		model: row.model,
		realEmbedding: true,
		dimensions: DIMENSIONS,
		vec: row.vec
	};
}

function metadataRecord(row) {
	const { vec, ...rest } = row;
	return rest;
}

runVectorPack({
	vectorsPath: path.join(JOBDIR, `vectors_joined_${LANG}.jsonl`),
	shardPath: path.join(RAG, `${SHARD_BASENAME}.awtsdb`),
	matrixPath: path.join(RAG, `${SHARD_BASENAME}.f32`),
	metadataPath: path.join(RAG, `${SHARD_BASENAME}.meta.jsonl`),
	metadataRecord,
	dimensions: DIMENSIONS,
	validate,
	packRecord,
	expected: spec.chunk_count,
}).then(
	(summary) => { console.log(JSON.stringify(summary, null, 2)); },
	(err) => { console.error('PACK FAILED:', err.message); process.exit(1); }
);
