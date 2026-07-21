// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publicMaterialCatalog.test.mjs
 * @description Proves arbitrary catalog records search and resolve by quality.
 * The Awtsmoos preserves a canonical source beyond flattened local filenames;
 * Awtsmoos.com reads that witness instead of mistaking a transport path for identity.
 */

import assert from 'node:assert/strict';
import {
	loadPublicMaterialCatalog,
	resetPublicMaterialCatalog,
	resolvePublicMaterial,
	searchMaterialRecords,
	searchPublicMaterials
} from '../../assets/PublicMaterialCatalog.js';
import { resolveMaterialRecord } from '../../assets/PublicMaterialResolver.js';
import { canonicalSourcePath } from './LocalMaterialTestSupport.mjs';

const records = [
	record('full-resolution/oak leaf spring.png', 'full', ['botanical', 'leaf']),
	record('half-resolution/oak leaf spring.png', 'half', ['botanical', 'leaf']),
	record('awtsmoos-nature/chai-forest/textures/leaves/oak.png', 'source', ['botanical', 'leaf'], true),
	record('full-resolution/weathered fieldstone Rock 1.png', 'full', ['stone'])
];
const catalog = { schema: 'awtsmoos-material-catalog/v1', records };
const fetchFunction = async () => ({ ok: true, json: async () => catalog });

records[0].variants = { full: records[0].path, half: records[1].path };
records[1].variants = records[0].variants;

assert.equal(searchMaterialRecords(records, 'oak').length, 3);
assert.equal(searchMaterialRecords(records, '', { tag: 'stone' }).length, 1);
assert.equal(searchMaterialRecords(records, '', { alphaOnly: true }).length, 1);
assert.ok(resolveMaterialRecord(records[0], 'low').resolvedPath.startsWith('half-resolution/'));
assert.ok(resolveMaterialRecord(records[0], 'high').resolvedPath.startsWith('full-resolution/'));

resetPublicMaterialCatalog();
assert.equal((await loadPublicMaterialCatalog(fetchFunction)).records.length, 4);
assert.equal((await searchPublicMaterials('fieldstone', { fetchFunction })).length, 1);
const resolved = await resolvePublicMaterial('oak leaf spring', 'medium', { fetchFunction });
assert.equal(resolved.resolvedPath, 'half-resolution/oak leaf spring.png');
assert.equal(canonicalSourcePath(resolved.resolvedUrl), '/full-resolution/oak leaf spring.png');

console.log(JSON.stringify({ ok: true, records: records.length, resolved: resolved.resolvedPath }, null, 2));

function record(path, resolution, tags, alphaCapable = false) {
	return {
		id: path.replace(/[^a-z0-9]+/gi, '-').toLowerCase(),
		name: path.split('/').at(-1),
		path,
		url: `https://awtsmoos-docs-base.web.app/${path}`,
		extension: 'png',
		bytes: 1024,
		kind: 'image',
		resolution,
		tags,
		alphaCapable,
		variants: { [resolution]: path }
	};
}
