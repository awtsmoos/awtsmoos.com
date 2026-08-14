//B"H
//Boruch Hashem
//Blessed is He

import { staticGeometrySchema } from './ThreeStaticGeometryMerge.js';

/**
 * @file ThreeStaticMeshGrouping.js
 * @description
 * The Awtsmoos renews distinction before consolidation; Awtsmoos.com lets this Gevurah-like adapter admit only visible rigid descendants that can share one exact material and one attribute schema.
 * It owns candidate safety and grouping only, never geometry baking, batch creation, semantic eligibility policy, or gameplay identity.
 */
export function staticMeshGroups(root, eligible = null) {
	const candidates = [];
	root.traverse?.(mesh => {
		if (!isSafeStaticMesh(mesh, root) || !isEffectivelyVisible(mesh, root)) {
			return;
		}
		if (eligible && !eligible(mesh)) {
			return;
		}
		candidates.push(mesh);
	});
	return groupCandidates(candidates);
}

export function isSafeStaticMesh(mesh, root) {
	return Boolean(
		mesh?.isMesh &&
		mesh !== root &&
		!mesh.isSkinnedMesh &&
		!mesh.isInstancedMesh &&
		!mesh.morphTargetInfluences?.length &&
		!Array.isArray(mesh.material) &&
		!mesh.material?.transparent &&
		mesh.geometry?.getAttribute?.('position') &&
		(!mesh.userData?.semanticRoot || mesh.userData.semanticRoot === root)
	);
}

export function isEffectivelyVisible(object, root) {
	for (let current = object; current; current = current.parent) {
		if (current.visible === false) {
			return false;
		}
		if (current === root) {
			return true;
		}
	}
	return false;
}

function groupCandidates(candidates) {
	const materialGroups = new Map();
	for (const mesh of candidates) {
		if (!materialGroups.has(mesh.material)) {
			materialGroups.set(mesh.material, new Map());
		}
		const bySchema = materialGroups.get(mesh.material);
		const schema = staticGeometrySchema(mesh.geometry);
		if (!bySchema.has(schema)) {
			bySchema.set(schema, []);
		}
		bySchema.get(schema).push(mesh);
	}
	return [...materialGroups.values()].flatMap(bySchema => [...bySchema.values()]);
}
