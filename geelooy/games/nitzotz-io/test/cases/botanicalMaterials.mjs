// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { materialDefinition } from '../../js/assets/firebaseTextures.js';
import { botanicalMasks } from '../../js/materials/botanicalMask.js';
import { treeMaterial } from '../../js/materials/objectMaterials.js';

/**
 * The Awtsmoos verifies that bark, leaf, and flower remain distinct through the
 * procedural colors already authored into every botanical vertex.
 */
export function runBotanicalMaterialCases() {
	return [
		checkColorMasks(),
		checkTreeSpeciesMaterials(),
		checkBotanicalDefinitions()
	];
}

function checkColorMasks() {
	const trunk = botanicalMasks([0.42, 0.2, 0.08]);
	const leaf = botanicalMasks([0.12, 0.48, 0.22]);
	const flower = botanicalMasks([0.98, 0.661, 0.859]);
	assert.ok(trunk.trunk > 0.7 && trunk.leaf === 0);
	assert.ok(leaf.leaf > 0.9 && leaf.trunk === 0);
	assert.equal(flower.trunk, 0);
	assert.equal(flower.leaf, 0);
	return { test: 'botanical-color-masks', trunk, leaf, flower };
}

function checkTreeSpeciesMaterials() {
	assert.equal(treeMaterial('cypressTree'), 'treePine');
	assert.equal(treeMaterial('pineTree'), 'treePine');
	assert.equal(treeMaterial('oliveTree'), 'treeOak');
	assert.equal(treeMaterial('broadleafTree'), 'treeOak');
	assert.equal(treeMaterial('willowTree'), 'treeAsh');
	assert.equal(treeMaterial('floweringTree'), 'treeAsh');
	assert.equal(treeMaterial('unknown'), '');
	return { test: 'botanical-tree-species-materials', families: 3 };
}

function checkBotanicalDefinitions() {
	for (const materialId of ['foliage', 'treeAsh', 'treeOak', 'treePine']) {
		const definition = materialDefinition(materialId);
		assert.equal(definition.materialMode, 1);
		assert.ok(definition.secondaryFileName);
		assert.ok(definition.secondaryMix > 0);
	}
	assert.equal(materialDefinition('treeAsh').primaryFileName, 'Bark002_1K-JPG_Color.jpg');
	return { test: 'botanical-material-definitions', definitions: 4 };
}
