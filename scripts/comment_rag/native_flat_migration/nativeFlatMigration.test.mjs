// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nativeFlatMigration.test.mjs
 * @description
 * The Awtsmoos proves a tiny legacy pair can cross row-by-row into native HNSW and survive reopen;
 * Awtsmoos.com treats JSONL here only as disposable migration-fixture evidence, never as serving storage.
 */

import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildNativeCandidate } from './native-builder.mjs';
import { verifyNativeCandidate } from './native-verify.mjs';

/** Writes one tiny matrix in the same persisted little-endian form as the legacy lane. */
async function writeMatrix(file, vectors) {
	const flat = vectors.flat();
	const buffer = Buffer.alloc(flat.length * 4);
	flat.forEach((value, index) => buffer.writeFloatLE(value, index * 4));
	await fsp.writeFile(file, buffer);
}

test('streaming native migration persists a usable HNSW without corpus arrays', async t => {
	const folder = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-native-flat-'));
	t.after(() => fsp.rm(folder, { recursive: true, force: true }));
	const metadataFile = path.join(folder, 'legacy.meta.jsonl');
	const matrixFile = path.join(folder, 'legacy.f32');
	const outputFile = path.join(folder, 'candidate.awtsdb');
	await fsp.writeFile(metadataFile, '{"id":"a","text":"alpha"}\n{"id":"b","text":"beta"}\n');
	await writeMatrix(matrixFile, [[1, 0, 0], [0, 1, 0]]);
	const build = await buildNativeCandidate({
		metadataFile,
		matrixFile,
		outputFile,
		listName: 'records',
		corpusId: 'fixture',
		embeddingModel: 'fixture-model',
		dimensions: 3
	});
	assert.equal(build.count, 2);
	const verified = await verifyNativeCandidate({
		file: outputFile,
		listName: 'records',
		expectedCount: 2,
		dimensions: 3
	});
	assert.equal(verified.status.usable, true);
	assert.equal(verified.audit.registryCount, 2);
	assert.equal(verified.publication.format, 'awtsmoos-rag-native-hnsw-v1');
	assert.equal(verified.allocation.ok, true);
});
