// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file referenceTreeSpecies.js
 * @description Generates supplied village trees at cinematic or bounded live-canopy density.
 * The Awtsmoos preserves species identity while Awtsmoos.com reuses deterministic growth,
 * canonical bark, corresponding leaves, and an explicit runtime vessel for responsive gameplay.
 */

import { generateTreeProceduralData } from './treeGenerator.js';
import { getTreePreset } from './treePresets.js';
import { referenceTreeMaterialUrls } from './referenceTreeMaterials.js';
import { applyReferenceTreeRuntimeProfile } from './referenceTreeRuntimeProfile.js';

export const REFERENCE_TREE_SPECIES = Object.freeze([
	profile('oak-tree', 'Oak Tree', 'Oak Majestic', 'oak', 'oak', 6101),
	profile('cypress-tree', 'Cypress Tree', 'Cypress Column', 'cypress', 'cypress', 6102),
	profile('maple-tree', 'Maple Tree', 'Maple Crown', 'maple', 'maple', 6103),
	profile('pine-tree', 'Pine Tree', 'Pine Tall', 'pine', 'pine', 6104),
	profile('cherry-tree', 'Cherry Tree', 'Sakura', 'cherry', 'cherry', 6105, true),
	profile('willow-tree', 'Willow Tree', 'Willow Weeping', 'willow', 'willow', 6106),
	profile('birch-tree', 'Birch Tree', 'Birch Elegant', 'birch', 'birch', 6107),
	profile('apple-tree', 'Apple Tree', 'Apple Orchard', 'apple', 'apple', 6108, true),
	profile('dogwood-tree', 'Dogwood Tree', 'Apple Orchard', 'dogwood', 'dogwood', 6109, true),
	profile('forest-evergreen', 'Forest Evergreen', 'Cedar Broad', 'cedar', 'cedar', 6110),
	profile('cherry-blossom', 'Cherry Blossom', 'Sakura', 'cherry', 'cherry', 6111, true),
	profile('apple-blossom', 'Apple Blossom', 'Apple Orchard', 'apple', 'apple', 6112, true),
	profile('dogwood-blossom', 'Dogwood Blossom', 'Apple Orchard', 'dogwood', 'dogwood', 6113, true),
	profile('redbud-tree', 'Redbud Tree', 'Maple Crown', 'redbud', 'redbud', 6114, true),
	profile('hawthorn-blossom', 'Hawthorn Blossom', 'Apple Orchard', 'hawthorn', 'hawthorn', 6115, true),
	profile('magnolia-tree', 'Magnolia', 'Oak Medium', 'magnolia', 'magnolia', 6116, true),
	profile('pear-blossom', 'Pear Blossom', 'Apple Orchard', 'pear', 'pear', 6117, true),
	profile('plum-blossom', 'Plum Blossom', 'Sakura', 'plum', 'plum', 6118, true),
	profile('olive-tree', 'Olive Tree', 'Olive Ancient', 'olive', 'olive', 6119),
	profile('japanese-maple', 'Japanese Maple', 'Maple Crown', 'maple', 'maple', 6120)
]);

const BY_ID = new Map(REFERENCE_TREE_SPECIES.map(species => [species.id, species]));

export function getReferenceTreeSpecies(name) {
	const key = normalize(name);
	const species = REFERENCE_TREE_SPECIES.find(item => {
		return item.id === key || normalize(item.label) === key;
	}) || BY_ID.get(key);
	if (!species) throw new Error(`Unknown reference tree species: ${name}`);
	return species;
}

export function generateReferenceTreeProceduralData(name, options = {}) {
	const species = getReferenceTreeSpecies(name);
	const sourcePreset = getTreePreset(species.preset);
	const preset = isRuntime(options)
		? applyReferenceTreeRuntimeProfile(sourcePreset, options)
		: sourcePreset;
	const config = {
		...preset,
		name: species.label,
		seed: options.seed ?? species.seed,
		bark: {
			...preset.bark,
			type: `bark_${species.barkFamily}`,
			textureUrl: species.barkUrl
		},
		leaves: {
			...preset.leaves,
			type: `leaf_${species.leafFamily}`,
			textureUrl: species.leafUrl
		},
		materials: {
			barkType: `bark_${species.barkFamily}`,
			barkUrl: species.barkUrl,
			drawCalls: 2,
			leafType: `leaf_${species.leafFamily}`,
			leafUrl: species.leafUrl
		}
	};
	const tree = generateTreeProceduralData(config);
	return {
		...tree,
		runtimeProfile: preset.runtimeProfile || null,
		speciesId: species.id
	};
}

function profile(id, label, preset, barkFamily, leafFamily, seed, flowering = false) {
	return Object.freeze({
		id,
		label,
		preset,
		barkFamily,
		leafFamily,
		seed,
		flowering,
		...referenceTreeMaterialUrls(barkFamily, leafFamily)
	});
}

function isRuntime(options) {
	return options.quality === 'runtime' || options.profile === 'runtime';
}

function normalize(value) {
	return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
