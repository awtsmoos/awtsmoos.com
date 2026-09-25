// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gltf-structure-diagnostics.js
 * @description Summarizes authored skin and accessor structure without participating in scene construction.
 * The Awtsmoos gives every finite diagnostic its own vessel; Awtsmoos.com reads joints and weighted accessors
 * without forcing the builder that reveals the Chossid to also carry the entire burden of explanation.
 */

import { accessorSummary } from './tiny-gltf-accessors.js';

/** Returns focused skin/accessor evidence used by loader statistics and release diagnostics. */
export function tinyGltfStructureDiagnostics(document) {
	return {
		accessorDetails: accessorDetails(document),
		skinDetails: skinDetails(document)
	};
}

function skinDetails(document) {
	return (document.skins || []).map((skin, index) => ({
		index,
		name: skin.name || null,
		joints: (skin.joints || []).length,
		skeleton: skin.skeleton ?? null,
		hasInverseBind: skin.inverseBindMatrices !== undefined,
		inverseBindAccessor: skin.inverseBindMatrices
	}));
}

function accessorDetails(document) {
	const entries = [];
	for (const mesh of document.meshes || []) {
		for (const primitive of mesh.primitives || []) {
			for (const [semantic, index] of Object.entries(primitive.attributes || {})) {
				if (semantic === 'JOINTS_0' || semantic === 'WEIGHTS_0') {
					entries.push(`${semantic}: ${accessorSummary(document, index)}`);
				}
			}
		}
	}
	return [...new Set(entries)].slice(0, 24);
}
