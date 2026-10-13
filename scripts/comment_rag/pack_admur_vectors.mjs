#!/usr/bin/env node
// B"H

/**
 * @file pack_admur_vectors.mjs
 * @description
 * Packs the Alter Rebbe (Admur HaZakein) English embedding vectors into the
 * Awtsmoos search vessels: a detached HNSW .awtsdb shard, a flat f32 matrix
 * mirror, and a line-aligned JSONL metadata sidecar — the exact format
 * flatMatrixSearch.js / flatMetadataReader.js consume.
 *
 * Run AFTER embed_admur_batches.py on the GPU box produced vectors.jsonl:
 *   node pack_admur_vectors.mjs
 *
 * Then register the shard (see README) and restart the search service.
 */

import path from 'path';
import { runVectorPack } from './lib/vector_pack_runtime.mjs';

const HOME = process.env.HOME || '/home/hatch';
const JOB = process.env.ADMUR_JOB_DIR || path.join(HOME, 'workspace', 'admur-embeddings');
// Production RAG dir: override with AWTS_RAG_DIR on the deploy target.
const RAG = process.env.AWTS_RAG_DIR || path.join(JOB, 'rag-out');
const SHARD_BASENAME = 'admur-hazaken-english-rag';
const DIMENSIONS = 384;

function validate(row, index) {
	if (!row.id || row.realEmbedding !== true) throw new Error(`bad vector ${index}`);
	if (row.dimensions !== DIMENSIONS) throw new Error(`bad dimensions ${index}`);
	if (!Array.isArray(row.vec) || row.vec.length !== DIMENSIONS) throw new Error(`bad vec ${index}`);
	for (const key of ['corpus', 'postId', 'seriesId', 'title', 'embeddingText']) {
		if (row[key] == null) throw new Error(`missing ${key} on ${row.id}`);
	}
}

function packRecord(row) {
	return {
		id: row.id,
		corpus: row.corpus,
		postId: row.postId,
		seriesId: row.seriesId,
		title: row.title,
		kind: row.kind,
		unitStart: row.unitStart,
		unitEnd: row.unitEnd,
		previewEnglish: row.previewEnglish,
		textPolicy: row.textPolicy,
		provider: row.provider,
		model: row.model,
		realEmbedding: true,
		dimensions: DIMENSIONS,
		vec: row.vec
	};
}

runVectorPack({
	vectorsPath: path.join(JOB, 'vectors.jsonl'),
	shardPath: path.join(RAG, `${SHARD_BASENAME}.awtsdb`),
	metadataPath: path.join(RAG, `${SHARD_BASENAME}.meta.jsonl`),
	matrixPath: path.join(RAG, `${SHARD_BASENAME}.f32`),
	manifestPath: path.join(RAG, `${SHARD_BASENAME}.fast-manifest.json`),
	summaryPath: path.join(JOB, 'pack-awtsdb-summary.json'),
	liveWalPath: process.env.AWTS_LIVE_WAL || '',
	listName: 'admurHazakenEnglishVectors',
	dimensions: DIMENSIONS,
	chunkSize: Number(process.env.ADMUR_PACK_CHUNK || 250),
	validate,
	packRecord,
	metadataRecord: packRecord,
	// Query-side routing covenant: shard declares its bge-small-en-v1.5
	// embedding space, the English semantic covenant, and the flat
	// exact-cosine lane this packer actually produces.
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
