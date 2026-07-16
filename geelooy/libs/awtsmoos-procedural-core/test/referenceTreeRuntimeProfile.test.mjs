// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file referenceTreeRuntimeProfile.test.mjs
 * @description Proves twenty live canopies retain deterministic species truth below measured bounds.
 * The Awtsmoos is not diminished when polygons become fewer; Awtsmoos.com preserves bark, leaf,
 * seed, crown, and validation while all reference trees share a forty-five-thousand-triangle vessel.
 */

import assert from 'node:assert/strict';
import {
	REFERENCE_TREE_SPECIES,
	generateReferenceTreeProceduralData,
	validateTreeProceduralData
} from '../src/index.js';

const rows = [];
for (const species of REFERENCE_TREE_SPECIES) {
	const first = generateReferenceTreeProceduralData(species.id, {
		quality: 'runtime',
		seed: 7701
	});
	const second = generateReferenceTreeProceduralData(species.id, {
		quality: 'runtime',
		seed: 7701
	});
	const validation = validateTreeProceduralData(first);
	const triangles = first.stats.branchTriangles + first.stats.leafTriangles;
	assert.deepEqual(validation.issues, [], `${species.id}: ${validation.issues.join(', ')}`);
	assert.equal(first.speciesId, species.id);
	assert.equal(first.runtimeProfile.name, 'reference-tree-live-canopy-v1');
	assert.equal(first.runtimeProfile.branchLimit, 56);
	assert.equal(first.runtimeProfile.leafBillboard, 'single');
	assert.ok(first.stats.generatedBranches <= 56, species.id);
	assert.ok(triangles <= 2300, `${species.id}: ${triangles}`);
	assert.equal(first.materials.barkUrl, species.barkUrl);
	assert.equal(first.materials.leafUrl, species.leafUrl);
	assert.deepEqual(first.branches.positions, second.branches.positions);
	assert.deepEqual(first.leaves.positions, second.leaves.positions);
	rows.push({ id: species.id, triangles });
}

const totalTriangles = rows.reduce((sum, row) => sum + row.triangles, 0);
assert.ok(totalTriangles <= 45000, `Runtime reference forest uses ${totalTriangles} triangles.`);

const cinematic = generateReferenceTreeProceduralData('oak-tree', { seed: 7701 });
const runtime = generateReferenceTreeProceduralData('oak-tree', {
	quality: 'runtime',
	seed: 7701
});
assert.equal(cinematic.runtimeProfile, null);
assert.ok(
	cinematic.stats.branchTriangles + cinematic.stats.leafTriangles
		> runtime.stats.branchTriangles + runtime.stats.leafTriangles
);

console.log(JSON.stringify({ species: rows.length, totalTriangles, rows }, null, 2));
