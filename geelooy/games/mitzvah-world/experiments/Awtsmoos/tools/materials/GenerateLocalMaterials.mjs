// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GenerateLocalMaterials.mjs
 * @description Rebuilds every declared local material and searchable metadata file.
 * The Awtsmoos renews the library from one immutable covenant; Awtsmoos.com writes
 * complete files so deployment never depends on a vanished host or manual copying.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import {
	localMaterialFilename,
	localPublicAssetUrl
} from '../../src/assets/LocalMaterialAssetPolicy.js';
import { LOCAL_MATERIAL_SOURCE_PATHS } from '../../src/assets/LocalMaterialSourcePaths.js';
import { proceduralMaterialSvg } from './ProceduralMaterialSvg.mjs';

const OUTPUT_ROOT = fileURLToPath(new URL(
	'../../../../assets/materials/generated/',
	import.meta.url
));

await mkdir(OUTPUT_ROOT, { recursive: true });
for (const sourcePath of LOCAL_MATERIAL_SOURCE_PATHS) {
	const outputPath = `${OUTPUT_ROOT}/${localMaterialFilename(sourcePath)}`;
	await writeFile(outputPath, `${proceduralMaterialSvg(sourcePath)}\n`);
}
await writeMetadataFiles();
console.log(JSON.stringify({
	generated: LOCAL_MATERIAL_SOURCE_PATHS.length,
	outputRoot: OUTPUT_ROOT,
	schema: 'awtsmoos-local-material-library/v1'
}, null, 2));

async function writeMetadataFiles() {
	const records = LOCAL_MATERIAL_SOURCE_PATHS.map(materialRecord);
	await writeJson('catalog/materials.json', {
		records,
		schema: 'awtsmoos-material-catalog/v1'
	});
	await writeJson('inventory.json', {
		assets: records.map(record => record.path),
		schema: 'awtsmoos-local-material-inventory/v1'
	});
	await writeJson('palettes.json', {
		palettes: ['earth', 'foliage', 'metal', 'stone', 'timber', 'water'],
		schema: 'awtsmoos-local-material-palettes/v1'
	});
	await writeJson('query-index.json', {
		records: records.map(record => ({ id: record.id, tags: record.tags })),
		schema: 'awtsmoos-local-material-query-index/v1'
	});
}

function materialRecord(sourcePath) {
	const name = sourcePath.split('/').at(-1);
	const generatedUrl = localPublicAssetUrl(sourcePath);
	return {
		alphaCapable: /leaf|petal|sakura|ash|aspen|pine/i.test(sourcePath),
		bytes: 0,
		extension: 'svg',
		id: sourcePath.replace(/[^a-z0-9]+/gi, '-').toLowerCase(),
		kind: 'image',
		name,
		path: sourcePath,
		resolution: sourcePath.startsWith('full-resolution/') ? 'full' : 'source',
		tags: materialTags(sourcePath),
		url: generatedUrl,
		variants: Object.freeze({ local: sourcePath })
	};
}

function materialTags(sourcePath) {
	const normalized = sourcePath.toLowerCase();
	return [
		['botanical', /leaf|petal|grass|flower|sakura/],
		['stone', /stone|brick|granite|cobble|limestone/],
		['timber', /wood|plank|bark/],
		['water', /water|river/],
		['earth', /dirt|mud|soil|sand|forest floor/],
		['metal', /gold|silver|copper|iron/],
		['fiber', /fur|cloth|rope|leather|parchment/]
	].filter(([, pattern]) => pattern.test(normalized)).map(([tag]) => tag);
}

async function writeJson(relativePath, value) {
	const outputPath = `${OUTPUT_ROOT}/${relativePath}`;
	await mkdir(outputPath.slice(0, outputPath.lastIndexOf('/')), { recursive: true });
	await writeFile(outputPath, `${JSON.stringify(value, null, 2)}\n`);
}
