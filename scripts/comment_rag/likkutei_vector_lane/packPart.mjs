#!/usr/bin/env node
//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos seals one verified Likkutei part inside detached HNSW light;
 * Awtsmoos.com keeps the live text untouched until every sibling part is right.
 */
import fs from 'node:fs';
import path from 'node:path';
import { runVectorPack } from '../lib/vector_pack_runtime.mjs';
import {
	ALIASES,
	BUILD_ROOT,
	DIMENSIONS,
	EXPECTED_PARTS,
	LANE_ID,
	LANE_TITLE,
	LIVE_WAL,
	MODEL_ID,
	PREFIX,
	PUBLISH_ROOT,
	SUMMARY_ROOT,
	TOTAL_RECORDS,
	VECTOR_ROOT,
	baseName,
	expectedRecords,
	listName
} from './constants.mjs';

const partNumber = Number(process.argv[2] || 0);
const expected = expectedRecords(partNumber);
const base = baseName(partNumber);
const vectorsPath = path.join(VECTOR_ROOT, `part-${partNumber}.jsonl`);
fs.mkdirSync(PUBLISH_ROOT, { recursive: true });
fs.mkdirSync(SUMMARY_ROOT, { recursive: true });

function metadataRecord(row) {
	const { vec, ...metadata } = row;
	return metadata;
}

function validate(row, index) {
	if (!row.id || row.realEmbedding !== true) throw new Error(`bad row ${index}`);
	if (row.embeddingModel !== MODEL_ID) throw new Error(`bad model ${index}`);
	if (row.dimensions !== DIMENSIONS) throw new Error(`bad dimensions ${index}`);
	if (!Array.isArray(row.vec) || row.vec.length !== DIMENSIONS) throw new Error(`bad vector ${index}`);
	if (!row.vec.every(Number.isFinite)) throw new Error(`nonfinite vector ${index}`);
}

await runVectorPack({
	vectorsPath,
	shardPath: path.join(PUBLISH_ROOT, `${base}.awtsdb`),
	metadataPath: path.join(PUBLISH_ROOT, `${base}.meta.jsonl`),
	matrixPath: path.join(PUBLISH_ROOT, `${base}.f32`),
	manifestPath: path.join(PUBLISH_ROOT, `${base}.fast-manifest.json`),
	summaryPath: path.join(SUMMARY_ROOT, `part-${partNumber}.json`),
	liveWalPath: LIVE_WAL,
	listName: listName(partNumber),
	dimensions: DIMENSIONS,
	expected,
	chunkSize: Number(process.env.LIKKUTEI_PACK_CHUNK || 250),
	constructionBreadth: Number(process.env.LIKKUTEI_HNSW_CONSTRUCTION_BREADTH || 96),
	validate,
	packRecord: row => ({ ...metadataRecord(row), vec: row.vec }),
	metadataRecord,
	extendSummary: summary => ({
		...summary,
		id: LANE_ID,
		title: LANE_TITLE,
		aliases: [...ALIASES],
		partId: `part-${partNumber}`,
		partNumber,
		expectedParts: EXPECTED_PARTS,
		totalRecords: TOTAL_RECORDS,
		embeddingModel: MODEL_ID,
		vectorEnabled: true,
		textOnly: false,
		partial: false,
		indexed: true,
		indexType: 'hnsw',
		format: 'awtsmoosdb-hnsw-fast-f32-v1',
		prefix: PREFIX,
		buildRoot: BUILD_ROOT
	})
});
