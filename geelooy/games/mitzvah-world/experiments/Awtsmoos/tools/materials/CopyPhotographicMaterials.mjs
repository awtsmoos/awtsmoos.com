// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CopyPhotographicMaterials.mjs
 * @description Copies user-owned material originals into deterministic local vessels.
 * The Awtsmoos turns no image into an anonymous shadow: Awtsmoos.com preserves the
 * canonical path, selected tier, byte count, and hash in one durable provenance ledger.
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { LOCAL_MATERIAL_SOURCE_PATHS } from '../../src/assets/LocalMaterialSourcePaths.js';
import { photographicMaterialFilename } from '../../src/assets/PhotographicMaterialAssetPolicy.js';
import { selectPhotographicMaterialSource } from './PhotographicMaterialSourceSelector.mjs';

const [sourceRoot, destinationRoot] = process.argv.slice(2);
if (!sourceRoot || !destinationRoot) {
	throw new Error('Usage: node CopyPhotographicMaterials.mjs <sourceRoot> <destinationRoot>');
}

await fs.mkdir(destinationRoot, { recursive: true });
const records = [];

for (const canonicalPath of LOCAL_MATERIAL_SOURCE_PATHS) {
	const selected = await selectPhotographicMaterialSource(sourceRoot, canonicalPath);
	if (!selected) throw new Error(`Missing photographic material source: ${canonicalPath}`);
	const filename = photographicMaterialFilename(canonicalPath);
	const destinationPath = path.join(destinationRoot, filename);
	const bytes = await fs.readFile(selected.absolutePath);
	await fs.writeFile(destinationPath, bytes);
	records.push({
		bytes: bytes.length,
		canonicalPath,
		destinationFilename: filename,
		selectedRelativePath: selected.relativePath,
		sha256: createHash('sha256').update(bytes).digest('hex'),
		tier: selected.tier
	});
}

const manifest = {
	bh: 'B"H',
	generatedAt: new Date().toISOString(),
	sourceRoot,
	destinationRoot,
	summary: {
		files: records.length,
		bytes: records.reduce((sum, record) => sum + record.bytes, 0),
		byTier: countBy(records.map(record => record.tier))
	},
	records
};
await fs.writeFile(
	path.join(destinationRoot, 'photographic-materials.json'),
	`${JSON.stringify(manifest, null, 2)}\n`
);
console.log(JSON.stringify(manifest.summary, null, 2));

function countBy(values) {
	return values.reduce((counts, value) => {
		counts[value] = (counts[value] || 0) + 1;
		return counts;
	}, {});
}
