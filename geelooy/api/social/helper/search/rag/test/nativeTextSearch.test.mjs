// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nativeTextSearch.test.mjs
 * @description
 * The Awtsmoos proves native Hebrew lexical search through the same immutable
 * shard session used by production RAG, including fresh-process persistence and
 * one shared multipart candidate budget rather than per-part multiplication.
 */

import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createRequire } from 'node:module';
import { buildNativeCandidate } from '../../../../../../../scripts/comment_rag/native_flat_migration/native-builder.mjs';

const require = createRequire(import.meta.url);
const { closeAllShardSessions } = require('../shardStore.js');
const { textSearchBudgets } = require('../textSearchBudget.js');
const { textSearchShard } = require('../textSearch.js');

/** Writes a tiny little-endian matrix identical to the legacy migration input. */
async function writeMatrix(file, vectors) {
	const values = vectors.flat();
	const buffer = Buffer.alloc(values.length * 4);
	values.forEach((value, index) => buffer.writeFloatLE(value, index * 4));
	await fsp.writeFile(file, buffer);
}

test('native RAG text search survives reopen and matches Hebrew without niqqud', async t => {
	const folder = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-rag-native-text-'));
	t.after(async () => {
		closeAllShardSessions();
		await fsp.rm(folder, { recursive: true, force: true });
	});
	const metadataFile = path.join(folder, 'legacy.meta.jsonl');
	const matrixFile = path.join(folder, 'legacy.f32');
	const outputFile = path.join(folder, 'candidate.awtsdb');
	await fsp.writeFile(metadataFile, [
		'{"id":"a","text":"בְּרֵאשִׁית בָּרָא אֱלֹהִים","title":"Genesis One"}',
		'{"id":"b","text":"another source","title":"Second"}'
	].join('\n') + '\n');
	await writeMatrix(matrixFile, [[1, 0, 0], [0, 1, 0]]);
	await buildNativeCandidate({
		metadataFile,
		matrixFile,
		outputFile,
		listName: 'records',
		corpusId: 'fixture',
		embeddingModel: 'fixture-model',
		dimensions: 3
	});
	const shard = {
		id: 'fixture',
		title: 'Fixture Torah',
		file: outputFile,
		listName: 'records',
		count: 2,
		dimensions: 3,
		indexType: 'hnsw'
	};
	const result = await textSearchShard(shard, 'בראשית', 5, {
		textCandidateBudget: 8,
		textMaxMs: 5000
	});
	assert.equal(result.source, 'awtsmoos-db-text-index');
	assert.equal(result.hits[0].row.id, 'a');
	assert.match(result.hits[0].row.text, /בְּרֵאשִׁית/u);
});

test('multipart budget is shared exactly instead of multiplied per physical shard', () => {
	const parts = Array.from({ length: 28 }, (_value, index) => ({
		id: `part-${index + 1}`
	}));
	const budgets = textSearchBudgets(parts, {
		textCandidateBudget: 2048,
		textMaxRows: 8000
	});
	assert.equal(budgets.candidateByPart.reduce((sum, value) => sum + value, 0), 2048);
	assert.equal(budgets.legacyRowsByPart.reduce((sum, value) => sum + value, 0), 8000);
	assert.equal(budgets.candidateByPart.length, 28);
	assert.equal(budgets.legacyRowsByPart.length, 28);
});
