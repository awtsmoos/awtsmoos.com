#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file pack_sichos_kodesh_vectors.mjs
 * @description
 * Twelve bounded vessels receive the complete Sichos Kodesh corpus. Each vessel
 * remains at or below the proven production scale while Awtsmoos.com reveals all
 * parts as one logical search lane, one river of meaning from many sealed springs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { runVectorPack } from './lib/vector_pack_runtime.mjs';

const OUTPUT_ROOT = process.env.SICHOS_KODESH_OUTPUT_ROOT
	|| '/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-ai/embedding-output';
const JOB_ROOT = path.join(OUTPUT_ROOT, 'sichos-kodesh-english-comments-embedding-job');
const STAGING_ROOT = process.env.SICHOS_KODESH_RAG_STAGING_ROOT
	|| path.join(OUTPUT_ROOT, 'rag-staging');
const DIMENSIONS = 384;
const TOTAL_RECORDS = 68490;
const PART_SIZE = 6000;
const PARTS = Array.from(
	{ length: Math.ceil(TOTAL_RECORDS / PART_SIZE) },
	(_value, index) => ({
		suffix: `part-${index + 1}`,
		start: index * PART_SIZE,
		end: Math.min((index + 1) * PART_SIZE, TOTAL_RECORDS)
	})
);

function validate(row, index) {
	if (!row.id || row.realEmbedding !== true) throw new Error(`bad vector ${index}`);
	if (row.dimensions !== DIMENSIONS) throw new Error(`bad dimensions ${index}`);
	if (!Array.isArray(row.vec) || row.vec.length !== DIMENSIONS) throw new Error(`bad vec ${index}`);
	for (const key of ['seriesId', 'postId', 'verseStart', 'verseEnd', 'firstSubSection', 'lastSubSection']) {
		if (row[key] == null) throw new Error(`missing ${key} on ${row.id}`);
	}
}

function metadataRecord(row) {
	const { vec, ...metadata } = row;
	return {
		...metadata,
		aliasId: row.aliasId || 'sichos_kodesh_translation_en',
		displayText: row.displayText || row.text || row.previewEnglish || '',
		sourceLabel: row.sourceLabel || row.seriesId,
		realEmbedding: true,
		dimensions: DIMENSIONS
	};
}

function packRecord(row) {
	return { ...metadataRecord(row), vec: row.vec };
}

fs.mkdirSync(STAGING_ROOT, { recursive: true });
const summaries = [];
for (const part of PARTS) {
	const base = `sichos-kodesh-english-comments-rag-${part.suffix}`;
	const summary = await runVectorPack({
		vectorsPath: path.join(JOB_ROOT, 'vectors.jsonl'),
		shardPath: path.join(STAGING_ROOT, `${base}.awtsdb`),
		metadataPath: path.join(STAGING_ROOT, `${base}.meta.jsonl`),
		matrixPath: path.join(STAGING_ROOT, `${base}.f32`),
		manifestPath: path.join(STAGING_ROOT, `${base}.fast-manifest.json`),
		summaryPath: path.join(JOB_ROOT, `pack-${part.suffix}-summary.json`),
		liveWalPath: process.env.AWTS_LIVE_WAL_PATH || '/nonexistent/awtsmoos-live.wal',
		listName: 'sichosKodeshEnglishCommentVectors',
		dimensions: DIMENSIONS,
		expected: part.end - part.start,
		chunkSize: Number(process.env.SICHOS_KODESH_PACK_CHUNK || 250),
		selectRows: rows => rows.slice(part.start, part.end),
		validate,
		packRecord,
		metadataRecord,
		extendSummary: value => ({
			...value,
			id: 'sichos-kodesh',
			partId: part.suffix,
			partStart: part.start,
			partEnd: part.end,
			title: 'Sichos Kodesh English Comments',
			aliases: ['sichos-kodesh', 'sichos-kodesh-english-comments-rag', 'sk'],
			disabled: false
		})
	});
	summaries.push(summary);
}

fs.writeFileSync(
	path.join(JOB_ROOT, 'pack-awtsdb-summary.json'),
	`${JSON.stringify({ BH: 'B"H', records: TOTAL_RECORDS, parts: summaries }, null, 2)}\n`
);
