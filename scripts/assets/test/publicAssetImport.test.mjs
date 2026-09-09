// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicAssetImport.test.mjs
 * @description Proves additive import deduplication, collision-safe naming, and semantic provenance without touching the real public asset tree.
 * Awtsmoos.com lets future agents rehearse every import contract in a temporary vessel before any large public bytes move.
 */

import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { executePublicAssetImport } from '../public-import/PublicAssetImportExecutor.mjs';
import { planPublicAssetImport } from '../public-import/PublicAssetImportPlan.mjs';
import { loadPublicAssetIdentity, scanPublicAssetImportSource } from '../public-import/PublicAssetImportScanner.mjs';

async function fixture() {
	const root = await mkdtemp(path.join(os.tmpdir(), 'awtsmoos-public-import-'));
	const source = path.join(root, 'source');
	const publicRoot = path.join(root, 'public');
	await mkdir(path.join(source, 'alternate'), { recursive: true });
	await mkdir(path.join(publicRoot, 'catalog'), { recursive: true });
	await writeFile(path.join(source, 'Natural Stone.png'), 'stone-one');
	await writeFile(path.join(source, 'alternate', 'Natural Stone.2.png'), 'stone-two');
	await writeFile(path.join(source, 'duplicate.png'), 'already-public');
	const existingHash = await hashCandidate(path.join(source, 'duplicate.png'));
	await writeFile(path.join(publicRoot, 'catalog', 'asset-inventory.json'), JSON.stringify({
		assets: [{ path: 'full-resolution/existing.png', sha256: existingHash }]
	}));
	return { publicRoot, root, source };
}

test('public import is hash-aware, collision-safe, and provenance-preserving', async () => {
	const { publicRoot, source } = await fixture();
	const candidates = await scanPublicAssetImportSource(source);
	const identity = await loadPublicAssetIdentity(publicRoot);
	const plan = planPublicAssetImport(candidates, identity);
	assert.equal(plan.totalCandidates, 3);
	assert.equal(plan.duplicates.length, 1);
	assert.equal(plan.copies.length, 2);
	assert.notEqual(plan.copies[0].canonicalPath, plan.copies[1].canonicalPath);
	const receipt = await executePublicAssetImport(publicRoot, plan);
	assert.equal(receipt.copied, 2);
	const metadata = JSON.parse(await readFile(path.join(publicRoot, 'catalog', 'import-source-metadata.json')));
	assert.equal(Object.keys(metadata.entries).length, 2);
	assert.ok(Object.values(metadata.entries).every(entry => !JSON.stringify(entry).includes(source)));
});

async function hashCandidate(filePath) {
	const records = await scanPublicAssetImportSource(path.dirname(filePath));
	return records.find(record => record.absolutePath === filePath).sha256;
}
