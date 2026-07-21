#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file verify_sichos_kodesh_rag_setup.mjs
 * @description
 * Every bounded vessel is counted and its persisted graph is opened before the
 * Awtsmoos permits all 68,490 sparks to enter the public Awtsmoos.com search lane.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const SearchDatabase = require('../../geelooy/api/social/helper/search/rag/searchDatabase.js');
const ROOT = process.env.SICHOS_KODESH_RAG_ROOT
	|| '/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-ai/embedding-output/rag-staging';
const TOTAL_RECORDS = 68490;
const PART_SIZE = 6000;
const PARTS = Array.from(
	{ length: Math.ceil(TOTAL_RECORDS / PART_SIZE) },
	(_value, index) => ({
		name: `sichos-kodesh-english-comments-rag-part-${index + 1}`,
		expected: Math.min(PART_SIZE, TOTAL_RECORDS - (index * PART_SIZE))
	})
);

function readJson(file) {
	return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sidecarAbsent(base) {
	return ['wal', 'journal', 'lock', 'tmp'].every(suffix => !fs.existsSync(`${base}.${suffix}`));
}

const reports = [];
for (const part of PARTS) {
	const databasePath = path.join(ROOT, `${part.name}.awtsdb`);
	const manifestPath = path.join(ROOT, `${part.name}.fast-manifest.json`);
	const metadataPath = path.join(ROOT, `${part.name}.meta.jsonl`);
	const matrixPath = path.join(ROOT, `${part.name}.f32`);
	for (const file of [databasePath, manifestPath, metadataPath, matrixPath]) {
		if (!fs.existsSync(file)) throw new Error(`missing ${file}`);
	}
	if (!sidecarAbsent(databasePath)) throw new Error(`write sidecar exists for ${databasePath}`);
	const manifest = readJson(manifestPath);
	if (manifest.records !== part.expected || manifest.listLength !== part.expected) {
		throw new Error(`manifest count mismatch for ${part.name}`);
	}
	if (manifest.dimensions !== 384 || manifest.id !== 'sichos-kodesh') {
		throw new Error(`manifest identity mismatch for ${part.name}`);
	}
	const database = new SearchDatabase(databasePath);
	database.open();
	try {
		const list = database.root.sichosKodeshEnglishCommentVectors;
		if (!list || Number(list.length) !== part.expected) throw new Error(`list mismatch for ${part.name}`);
		const index = database.vector.getIndex(list);
		const registryCount = Number(index?.registry?.count?.() || 0);
		if (registryCount !== part.expected || Number(index?.entryNodeID ?? -1) < 0) {
			throw new Error(`persisted index mismatch for ${part.name}`);
		}
		reports.push({
			name: part.name,
			records: Number(list.length),
			registryCount,
			entryNodeID: Number(index.entryNodeID),
			bytes: fs.statSync(databasePath).size,
			metadataBytes: fs.statSync(metadataPath).size,
			matrixBytes: fs.statSync(matrixPath).size
		});
	} finally {
		database.close();
	}
}

const total = reports.reduce((sum, report) => sum + report.records, 0);
if (total !== TOTAL_RECORDS) throw new Error(`combined count mismatch ${total}`);
console.log(JSON.stringify({ BH: 'B"H', root: ROOT, total, parts: reports }, null, 2));
