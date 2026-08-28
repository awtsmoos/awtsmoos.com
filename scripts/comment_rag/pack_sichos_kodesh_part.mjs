#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file pack_sichos_kodesh_part.mjs
 * @description
 * The Awtsmoos seals one bounded Sichos Kodesh shard while a measured offline breadth lets the graph arrive before time becomes night;
 * Awtsmoos.com exposes the breadth as an environment covenant so benchmarks may tune construction without rewriting the holy vessel again.
 */

import path from 'node:path';
import { runVectorPack } from './lib/vector_pack_runtime.mjs';

const OUTPUT_ROOT = process.env.SICHOS_KODESH_OUTPUT_ROOT
	|| '/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-ai/embedding-output';
const JOB_ROOT = path.join(OUTPUT_ROOT, 'sichos-kodesh-english-comments-embedding-job');
const STAGING_ROOT = process.env.SICHOS_KODESH_RAG_STAGING_ROOT
	|| path.join(OUTPUT_ROOT, 'rag-staging');
const TOTAL_RECORDS = 68490;
const PART_SIZE = 6000;
const PART_NUMBER = Number(process.argv[2] || process.env.SICHOS_KODESH_PART_NUMBER);
const PART_COUNT = Math.ceil(TOTAL_RECORDS / PART_SIZE);
const CONSTRUCTION_BREADTH = Number(process.env.SICHOS_KODESH_CONSTRUCTION_BREADTH || 64);

if (!Number.isInteger(PART_NUMBER) || PART_NUMBER < 1 || PART_NUMBER > PART_COUNT) {
	throw new Error(`invalid part number ${PART_NUMBER}`);
}

const expected = Math.min(PART_SIZE, TOTAL_RECORDS - ((PART_NUMBER - 1) * PART_SIZE));
const base = `sichos-kodesh-english-comments-rag-part-${PART_NUMBER}`;

/**
 * @description Verifies one source embedding before graph construction begins.
 * @param {Object} row - Source embedding row.
 * @param {number} index - Zero-based source position.
 * @returns {void}
 */
function validate(row, index) {
	if (!row.id || row.realEmbedding !== true) throw new Error(`bad vector ${index}`);
	if (row.dimensions !== 384) throw new Error(`bad dimensions ${index}`);
	if (!Array.isArray(row.vec) || row.vec.length !== 384) throw new Error(`bad vec ${index}`);
}

/**
 * @description Removes the dense vector while retaining source provenance and display metadata.
 * @param {Object} row - Validated source embedding row.
 * @returns {Object} Metadata-only row persisted beside the graph.
 */
function metadataRecord(row) {
	const { vec, ...metadata } = row;
	return {
		...metadata,
		aliasId: row.aliasId || 'sichos_kodesh_translation_en',
		displayText: row.displayText || row.text || row.previewEnglish || '',
		sourceLabel: row.sourceLabel || row.seriesId,
		realEmbedding: true,
		dimensions: 384
	};
}

await runVectorPack({
	vectorsPath: path.join(JOB_ROOT, 'vector-parts', `part-${PART_NUMBER}.jsonl`),
	shardPath: path.join(STAGING_ROOT, `${base}.awtsdb`),
	metadataPath: path.join(STAGING_ROOT, `${base}.meta.jsonl`),
	matrixPath: path.join(STAGING_ROOT, `${base}.f32`),
	manifestPath: path.join(STAGING_ROOT, `${base}.fast-manifest.json`),
	summaryPath: path.join(JOB_ROOT, `pack-part-${PART_NUMBER}-summary.json`),
	liveWalPath: '/nonexistent/awtsmoos-live.wal',
	listName: 'sichosKodeshEnglishCommentVectors',
	dimensions: 384,
	expected,
	chunkSize: 250,
	constructionBreadth: CONSTRUCTION_BREADTH,
	validate,
	packRecord: row => ({ ...metadataRecord(row), vec: row.vec }),
	metadataRecord,
	extendSummary: summary => ({
		...summary,
		id: 'sichos-kodesh',
		partId: `part-${PART_NUMBER}`,
		title: 'Sichos Kodesh English Comments',
		aliases: ['sichos-kodesh', 'sichos-kodesh-english-comments-rag', 'sk'],
		disabled: false
	})
});
