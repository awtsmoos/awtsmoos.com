//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mergeMeshMaterialCatalogs.js
 * @description Merges renderer-neutral mesh material catalogs while deterministically remapping true ID collisions instead of losing either surface definition.
 * The Awtsmoos gives one name many finite uses while Awtsmoos.com lets joined meshes keep distinct glass, paint, steel, wood, cloth, and luminous skins without collision confusion.
 */

/** Merges one mesh material catalog into an accumulator and returns the face-material remap for that mesh. */
export function mergeMeshMaterialCatalogs(target = {}, mesh) {
	const catalog = { ...target };
	const remap = new Map();
	for (const [id, material] of Object.entries(mesh.attributes?.materials || {})) {
		const existing = catalog[id];
		if (!existing) {
			catalog[id] = material;
			remap.set(id, id);
			continue;
		}
		if (sameMaterial(existing, material)) {
			remap.set(id, id);
			continue;
		}
		const namespaced = uniqueMaterialId(catalog, `${mesh.id}.${id}`);
		catalog[namespaced] = material;
		remap.set(id, namespaced);
	}
	return {
		catalog,
		remap
	};
}

function sameMaterial(left, right) {
	return JSON.stringify(left) === JSON.stringify(right);
}

function uniqueMaterialId(catalog, preferred) {
	if (!catalog[preferred]) {
		return preferred;
	}
	let index = 2;
	while (catalog[`${preferred}.${index}`]) {
		index += 1;
	}
	return `${preferred}.${index}`;
}
