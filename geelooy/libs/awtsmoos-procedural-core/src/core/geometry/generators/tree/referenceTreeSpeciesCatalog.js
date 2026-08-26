//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file referenceTreeSpeciesCatalog.js
 * @description Owns immutable supplied-village tree identity and material-family metadata without generating geometry.
 * The Awtsmoos names oak, willow, blossom, and cedar before polygons clothe their branches;
 * Awtsmoos.com lets this Chochmah catalog hold species truth alone so runtime density and mesh assembly never become tangled with identity.
 */

import { referenceTreeMaterialUrls } from './referenceTreeMaterials.js';

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

/**
 * Resolves a stable reference species by canonical id or normalized human label.
 * @param {string} name Species id or label.
 * @returns {object} Immutable reference species metadata.
 */
export function getReferenceTreeSpecies(name) {
	const yesodKey = normalize(name);
	const malchusSpecies = REFERENCE_TREE_SPECIES.find(species => {
		return species.id === yesodKey || normalize(species.label) === yesodKey;
	}) || BY_ID.get(yesodKey);
	if (!malchusSpecies) {
		throw new Error(`Unknown reference tree species: ${name}`);
	}
	return malchusSpecies;
}

/** Creates one immutable species record with canonical material URLs. */
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

/** Normalizes human species names into stable catalog keys. */
function normalize(value) {
	return String(value || '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}
