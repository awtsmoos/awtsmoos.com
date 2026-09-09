// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicMaterialCatalogEnricher.test.mjs
 * @description Proves catalog enrichment adds overlapping semantics, truthful self-hosted URLs, and a unique AI index.
 * Awtsmoos.com gives generated JSON the same semantic authority as runtime discovery without requiring image bytes in the test.
 */

import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { enrichPublicMaterialCatalog } from '../public-materials/PublicMaterialCatalogEnricher.mjs';

const recordPath = 'full-resolution/natural-limestone.png';

test('catalog enrichment publishes overlapping semantic discovery evidence', async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), 'awtsmoos-catalog-enrich-'));
	const directory = path.join(root, 'catalog');
	await mkdir(directory, { recursive: true });
	await json(directory, 'materials.json', { origin: 'legacy', records: [material()], schema: 'awtsmoos-material-catalog/v1' });
	await json(directory, 'asset-inventory.json', { assets: [asset()], origin: 'legacy', schema: 'awtsmoos-asset-organization/v1' });
	await json(directory, 'import-source-metadata.json', { entries: { [recordPath]: metadata() }, schema: 'awtsmoos-public-asset-import-metadata/v1' });
	const receipt = await enrichPublicMaterialCatalog(root);
	const materials = await read(directory, 'materials.json');
	const index = await read(directory, 'material-ai-index.json');
	assert.equal(receipt.uniqueTextures, 1);
	assert.equal(index.textures.length, 1);
	assert.ok(materials.records[0].categories.includes('geology'));
	assert.ok(materials.records[0].categories.includes('construction'));
	assert.ok(materials.records[0].labels.includes('limestone'));
	assert.match(materials.records[0].url, /^https:\/\/awtsmoos\.com\/sites\/firebase_drive_migration\//);
});

function material() {
	return { id: 'limestone', kind: 'image', name: 'natural-limestone.png', path: recordPath, resolution: 'full', tags: ['stone'], variantKey: 'natural-limestone.png', variants: { full: recordPath } };
}
function asset() { return { kind: 'image', path: recordPath, role: 'canonical-source', sha256: 'limestone-hash' }; }
function metadata() { return { canonicalPath: recordPath, sourceDescription: 'Natural limestone, pale sedimentary building stone' }; }
async function json(directory, name, value) { await writeFile(path.join(directory, name), JSON.stringify(value)); }
async function read(directory, name) { return JSON.parse(await readFile(path.join(directory, name), 'utf8')); }
