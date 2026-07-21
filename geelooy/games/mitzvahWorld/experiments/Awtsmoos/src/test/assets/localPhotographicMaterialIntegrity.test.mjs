// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file localPhotographicMaterialIntegrity.test.mjs
 * @description Verifies every copied photographic vessel against its provenance hash.
 * The Awtsmoos leaves no stone without a name and no name without truthful bytes;
 * Awtsmoos.com proves all declared surfaces exist, match, and remain non-empty.
 */

import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { LOCAL_MATERIAL_SOURCE_PATHS } from '../../assets/LocalMaterialSourcePaths.js';
import { photographicMaterialFilename } from '../../assets/PhotographicMaterialAssetPolicy.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const ASSET_DIRECTORY = path.resolve(
	TEST_DIRECTORY,
	'../../../../../assets/materials/local'
);

test('all declared local photographic materials match their provenance manifest', async () => {
	const manifest = JSON.parse(await fs.readFile(
		path.join(ASSET_DIRECTORY, 'photographic-materials.json'),
		'utf8'
	));
	assert.equal(manifest.records.length, LOCAL_MATERIAL_SOURCE_PATHS.length);
	const records = new Map(manifest.records.map(record => [record.canonicalPath, record]));
	for (const canonicalPath of LOCAL_MATERIAL_SOURCE_PATHS) {
		const record = records.get(canonicalPath);
		assert.ok(record, `Missing provenance for ${canonicalPath}`);
		assert.equal(record.destinationFilename, photographicMaterialFilename(canonicalPath));
		const bytes = await fs.readFile(path.join(ASSET_DIRECTORY, record.destinationFilename));
		assert.ok(bytes.length > 0, `Empty photographic material ${canonicalPath}`);
		assert.equal(bytes.length, record.bytes);
		assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256);
	}
});
