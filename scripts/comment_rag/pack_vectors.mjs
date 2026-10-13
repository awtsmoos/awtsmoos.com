#!/usr/bin/env node
// B"H

/**
 * @file pack_vectors.mjs
 * @description
 * Generic packer: turns any corpus's vectors-<corpus>.jsonl into the Awtsmoos
 * search vessels — a detached HNSW .awtsdb shard, a flat f32 matrix mirror,
 * and a line-aligned JSONL metadata sidecar (the exact format
 * flatMatrixSearch.js / flatMetadataReader.js consume).
 *
 * Generalizes pack_admur_vectors.mjs. Run AFTER embed_batches.py produced
 * vectors-<corpus>.jsonl on the GPU box:
 *
 *   CORPUS_NAME=rambam \
 *   CORPUS_SHARD=rambam-english-rag \
 *   CORPUS_JOB_DIR=/path/to/corpus-embeddings \
 *   AWTS_RAG_DIR=/path/to/production/ai/comment-rag \
 *   node pack_vectors.mjs
 *
 * Then register the shard basename in
 * geelooy/api/social/helper/search/rag/canonicalShards.js
 * (CANONICAL_SHARD_FILES) and restart the search service.
 */

import path from 'path';
import { runVectorPack } from './lib/vector_pack_runtime.mjs';

const HOME = process.env.HOME || '/home/hatch';
const CORPUS = process.env.CORPUS_NAME || 'corpus';
const JOB = process.env.CORPUS_JOB_DIR || path.join(HOME, 'workspace', 'corpus-embeddings');
const RAG = process.env.AWTS_RAG_DIR || path.join(JOB, 'rag-out');
const SHARD_BASENAME = process.env.CORPUS_SHARD || `${CORPUS}-english-rag`;
const DIMENSIONS = 384;

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
		postId: row.postId,
		seriesId: row.seriesId || '',
		title: row.title || '',
		kind: row.kind || '',
		unitStart: row.unitStart || '',
		unitEnd: row.unitEnd || '',
		previewEnglish: row.previewEnglish || '',
		textPolicy: row.textPolicy || '',
		provider: row.provider || '',
		model: row.model || '',
		realEmbedding: true,
		dimensions: DIMENSIONS,
		vec: row.vec
	};
}

runVectorPack({
	vectorsPath: path.join(JOB, `vectors-${CORPUS}.jsonl`),
	shardPath: path.join(RAG, `${SHARD_BASENAME}.awtsdb`),
	metadataPath: path.join(RAG, `${SHARD_BASENAME}.meta.jsonl`),
	matrixPath: path.join(RAG, `${SHARD_BASENAME}.f32`),
	manifestPath: path.join(RAG, `${SHARD_BASENAME}.fast-manifest.json`),
	summaryPath: path.join(JOB, `pack-${CORPUS}-summary.json`),
	liveWalPath: process.env.AWTS_LIVE_WAL || '',
	listName: `${CORPUS}EnglishVectors`,
	dimensions: DIMENSIONS,
	chunkSize: Number(process.env.CORPUS_PACK_CHUNK || 250),
	validate,
	packRecord,
	metadataRecord: packRecord,
	// The query side routes on these three seals: the shard declares its
	// embedding space so the query embedder can pick the matching model
	// (bge-small-en-v1.5 GGUF), the English semantic covenant, and the
	// flat exact-cosine lane this packer actually produces.
	extendSummary: summary => ({
		...summary,
		sidecarsAreStorageOnly: true,
		embeddingModel: 'bge-small-en-v1.5',
		semanticLanguage: 'en',
		indexType: 'flat-f32'
	})
}).catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
