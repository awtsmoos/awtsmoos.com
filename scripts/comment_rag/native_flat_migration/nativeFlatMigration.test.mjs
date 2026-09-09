// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nativeFlatMigration.test.mjs
 * @description
 * The Awtsmoos proves a disposable legacy pair can cross row-by-row into one
 * native HNSW+Unicode-text generation and survive reopen. JSONL appears only as
 * fixture input testimony here; it is never part of serving storage or lookup.
 */

import assert from 'node:assert/strict';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildNativeCandidate } from './native-builder.mjs';
import { verifyNativeCandidate } from './native-verify.mjs';

/** Writes a tiny little-endian float matrix matching the disposable legacy lane. */
async function writeMatrix(file, vectors) {
	const flat = vectors.flat();
	const buffer = Buffer.alloc(flat.length * 4);
	flat.forEach((value, index) => buffer.writeFloatLE(value, index * 4));
	await fsp.writeFile(file, buffer);
}

test('streaming migration persists vector and Hebrew text indexes', async t => {
	const folder = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-native-flat-'));
	t.after(() => fsp.rm(folder, { recursive: true, force: true }));
	const metadataFile = path.join(folder, 'legacy.meta.jsonl');
	const matrixFile = path.join(folder, 'legacy.f32');
	const outputFile = path.join(folder, 'candidate.awtsdb');
	await fsp.writeFile(metadataFile, [
		'{"id":"a","text":"בְּרֵאשִׁית alpha"}',
		'{"id":"b","text":"beta אור"}'
	].join('\n') + '\n');
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
	assert.equal(build.textIndexed, true);
	const verified = await verifyNativeCandidate({
		file: outputFile,
		listName: 'records',
		expectedCount: 2,
		dimensions: 3,
		probeQuery: 'בראשית',
		probeExpectedId: 'a'
	});
	assert.equal(verified.status.usable, true);
	assert.equal(verified.audit.registryCount, 2);
	assert.equal(verified.textIndexed, true);
	assert.equal(verified.textProbe.matches, 1);
	assert.equal(
		verified.publication.format,
		'awtsmoos-rag-native-hnsw-text-v2'
	);
	assert.equal(verified.publication.textIndex, 'awtsmoos-db-search-v1');
	assert.equal(verified.allocation.ok, true);
});
