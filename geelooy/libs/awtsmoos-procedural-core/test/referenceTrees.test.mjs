// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file referenceTrees.test.mjs
 * @description Proves every supplied village tree generates with bark and leaf source identity.
 * The Awtsmoos renews branch, blossom, bark, and leaf as one living tree; Awtsmoos.com keeps
 * twenty named species deterministic, two-draw-call, and linked to canonical source textures.
 */

import assert from 'node:assert/strict';
import {
	REFERENCE_TREE_SPECIES,
	generateReferenceTreeProceduralData,
	getReferenceTreeSpecies,
	validateTreeProceduralData
} from '../src/index.js';

assert.equal(REFERENCE_TREE_SPECIES.length, 20);
assert.equal(new Set(REFERENCE_TREE_SPECIES.map(species => species.id)).size, 20);
const rows = [];
for (const species of REFERENCE_TREE_SPECIES) {
	assert.match(species.barkUrl, /awtsmoos-docs-base\.web\.app\//);
	assert.match(species.leafUrl, /awtsmoos-docs-base\.web\.app\//);
	assert.doesNotMatch(species.barkUrl, /half-resolution|quarter-resolution|chai-forest-half/);
	assert.doesNotMatch(species.leafUrl, /half-resolution|quarter-resolution|chai-forest-half/);
	const tree = generateReferenceTreeProceduralData(species.id);
	const validation = validateTreeProceduralData(tree);
	assert.deepEqual(validation.issues, [], `${species.id}: ${validation.issues.join(', ')}`);
	assert.equal(tree.drawCalls, 2);
	assert.equal(tree.materials.barkUrl, species.barkUrl);
	assert.equal(tree.materials.leafUrl, species.leafUrl);
	assert.equal(tree.branches.material.textureUrl, species.barkUrl);
	assert.equal(tree.leaves.material.textureUrl, species.leafUrl);
	rows.push({
		id: species.id,
		triangles: tree.stats.branchTriangles + tree.stats.leafTriangles
	});
}

const first = generateReferenceTreeProceduralData('dogwood-tree', { seed: 7701 });
const second = generateReferenceTreeProceduralData('Dogwood Tree', { seed: 7701 });
assert.deepEqual(first.branches.positions, second.branches.positions);
assert.deepEqual(first.leaves.positions, second.leaves.positions);
assert.equal(getReferenceTreeSpecies('Magnolia').id, 'magnolia-tree');
console.log(JSON.stringify({ species: rows.length, rows }, null, 2));
