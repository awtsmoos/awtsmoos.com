#!/usr/bin/env node
// B"H

/**
 * @file pack_meluket_english_vectors.mjs
 * @chapter The Meluket Records Gather Before One Final Graph
 * @description
 * Packs canonical records with a bounded unindexed load, one final HNSW rebuild,
 * full metadata lineage, fast-f32 mirrors, and live-WAL isolation.
 */

import path from 'path';
import { runVectorPack } from './lib/vector_pack_runtime.mjs';

const ROOT = process.env.AWTS_DB_ROOT || '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(ROOT, 'ai/comment-rag');
const JOB = path.join(RAG, 'meluket-english-comments-embedding-job');
const DIMENSIONS = 384;

function validate(row, index) {
	if (!row.id || row.realEmbedding !== true) throw new Error(`bad vector ${index}`);
	if (row.dimensions !== DIMENSIONS) throw new Error(`bad dimensions ${index}`);
	if (!Array.isArray(row.vec) || row.vec.length !== DIMENSIONS) throw new Error(`bad vec ${index}`);
	for (const key of ['seriesId', 'postId', 'aliasId', 'commentPath', 'verseStart', 'verseEnd']) {
		if (row[key] == null) throw new Error(`missing ${key} on ${row.id}`);
	}
}

function packRecord(row) {
	return {
		id: row.id,
		seriesId: row.seriesId,
		postId: row.postId,
		aliasId: row.aliasId,
		commentPath: row.commentPath,
		title: row.title,
		verseStart: row.verseStart,
		verseEnd: row.verseEnd,
		firstSubSection: row.firstSubSection,
		lastSubSection: row.lastSubSection,
		commentIds: row.commentIds,
		firstCommentId: row.firstCommentId,
		lastCommentId: row.lastCommentId,
		commentCount: row.commentCount,
		rowStart: row.rowStart,
		rowEnd: row.rowEnd,
		textPolicy: row.textPolicy,
		text: row.text,
		previewEnglish: row.previewEnglish,
		embeddingTextPolicy: row.embeddingTextPolicy,
		embeddingManifest: row.embeddingManifest,
		provider: row.provider,
		realEmbedding: true,
		dimensions: DIMENSIONS,
		embeddingCharsUsed: row.embeddingCharsUsed,
		shortenedForModelLimit: row.shortenedForModelLimit,
		vec: row.vec
	};
}

runVectorPack({
	vectorsPath: path.join(JOB, 'vectors.jsonl'),
	shardPath: path.join(RAG, 'meluket-english-comments-rag.awtsdb'),
	metadataPath: path.join(RAG, 'meluket-english-comments-rag.meta.jsonl'),
	matrixPath: path.join(RAG, 'meluket-english-comments-rag.f32'),
	manifestPath: path.join(RAG, 'meluket-english-comments-rag.fast-manifest.json'),
	summaryPath: path.join(JOB, 'pack-awtsdb-summary.json'),
	liveWalPath: path.join(ROOT, 'socialPacked/social.heichel.ikar.comments.fs.awtsdb.wal'),
	listName: 'meluketEnglishCommentVectors',
	dimensions: DIMENSIONS,
	chunkSize: Number(process.env.MELUKET_PACK_CHUNK || 250),
	validate,
	packRecord,
	metadataRecord: packRecord,
	extendSummary: summary => ({ ...summary, sidecarsAreStorageOnly: true })
}).catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
