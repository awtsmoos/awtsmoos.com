#!/usr/bin/env node
// B"H

/**
 * @file pack_sefer_hasichos_english_vectors.mjs
 * @chapter Fifteen Thousand Teachings Enter Before One Graph Is Woven
 * @description
 * Packs the canonical Sefer HaSichos records through the explicit one-rebuild
 * bulk lifecycle while preserving reference lineage and fast-f32 compatibility.
 */

import path from 'path';
import { runVectorPack } from './lib/vector_pack_runtime.mjs';

const ROOT = process.env.AWTS_DB_ROOT || '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(ROOT, 'ai/comment-rag');
const JOB = path.join(RAG, 'sefer-hasichos-english-comments-embedding-job');
const DIMENSIONS = 384;

function hasHebrew(text) {
	return /[\u0590-\u05ff]/.test(String(text || ''));
}

function qIndex(id) {
	const match = String(id || '').match(/:q(\d+)$/);
	return match ? Number(match[1]) : null;
}

function commentWindow(id) {
	const match = String(id || '').match(/:c(\d+)-(\d+)(?::q\d+)?$/);
	return match ? { commentStart: Number(match[1]), commentEnd: Number(match[2]) } : {};
}

function metadataRecord(row) {
	const { vec, ...rest } = row;
	return {
		...rest,
		qIndex: row.qIndex ?? qIndex(row.id),
		...commentWindow(row.id),
		realEmbedding: true,
		dimensions: DIMENSIONS
	};
}

function packRecord(row) {
	return { ...metadataRecord(row), vec: row.vec };
}

function validate(row, index) {
	if (!row.id || row.realEmbedding !== true) throw new Error(`bad vector ${index}`);
	if (row.dimensions !== DIMENSIONS) throw new Error(`bad dimensions ${index}`);
	if (!Array.isArray(row.vec) || row.vec.length !== DIMENSIONS) throw new Error(`bad vec ${index}`);
	if (hasHebrew(row.text)) throw new Error(`Hebrew/Yiddish text ${row.id}`);
}

runVectorPack({
	vectorsPath: path.join(JOB, 'vectors.jsonl'),
	shardPath: path.join(RAG, 'sefer-hasichos-english-comments-rag.awtsdb'),
	metadataPath: path.join(RAG, 'sefer-hasichos-english-comments-rag.meta.jsonl'),
	matrixPath: path.join(RAG, 'sefer-hasichos-english-comments-rag.f32'),
	manifestPath: path.join(RAG, 'sefer-hasichos-english-comments-rag.fast-manifest.json'),
	summaryPath: path.join(JOB, 'pack-awtsdb-summary.json'),
	liveWalPath: path.join(ROOT, 'socialPacked/social.heichel.ikar.comments.fs.awtsdb.wal'),
	listName: 'seferHaSichosEnglishCommentVectors',
	dimensions: DIMENSIONS,
	expected: 15022,
	chunkSize: Number(process.env.SHICHOSE_PACK_CHUNK || 250),
	validate,
	packRecord,
	metadataRecord,
	extendSummary: summary => ({
		...summary,
		metadataStore: 'canonical-awtsmoosdb-list',
		metadataSidecarPolicy: 'full-metadata-mirror-for-fast-f32-index-compatibility; not canonical'
	})
}).catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});
