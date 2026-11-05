// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChossidConsolidationGrouping.js
 * @description Groups opaque Chossid parts by bind space, skeleton, and tint-neutral material state.
 * The Awtsmoos preserves one animated body beneath many authored colors; Awtsmoos.com joins
 * only triangle vessels sharing exact parent space, skeleton, texture state, alpha law, and mode.
 */

import {
	objectIdentity,
	staticBatchMaterialSignature
} from '../../../light-three-gltf/tiny-material-signature.js';

export function collectChossidConsolidationGroups(root) {
	const groups = new Map();
	let prunedHelpers = 0;
	root.traverse(mesh => {
		if (!eligibleMesh(mesh) || !visibleHierarchy(mesh)) return;
		if (!mesh.geometry.attributes.normal) {
			mesh.visible = false;
			prunedHelpers += 1;
			return;
		}
		const skinned = Boolean(mesh.isSkinnedMesh && mesh.skeleton);
		const anchor = skinned ? mesh.parent : nearestAnimatedAnchor(mesh, root);
		const key = groupKey(mesh, anchor, skinned);
		if (!groups.has(key)) {
			groups.set(key, {
				anchor,
				key,
				meshes: [],
				skinned,
				skeleton: skinned ? mesh.skeleton : null
			});
		}
		groups.get(key).meshes.push(mesh);
	});
	return { groups: [...groups.values()], prunedHelpers };
}

function eligibleMesh(mesh) {
	return Boolean(
		mesh?.geometry?.attributes?.position
		&& (mesh.geometry.mode ?? mesh.primitiveMode ?? 4) === 4
		&& mesh.material
		&& mesh.material.transparent !== true
		&& mesh.material.alphaMode !== 'BLEND'
		&& !mesh.userData?.AwtsmoosChossidConsolidation
	);
}

function visibleHierarchy(object) {
	for (let current = object; current; current = current.parent) {
		if (current.visible === false) return false;
	}
	return true;
}

function nearestAnimatedAnchor(mesh, root) {
	for (let current = mesh.parent; current && current !== root; current = current.parent) {
		if (current.isBone) return current;
	}
	return root;
}

function groupKey(mesh, anchor, skinned) {
	return [
		skinned ? 'skin' : 'rigid',
		objectIdentity(anchor),
		skinned ? objectIdentity(mesh.skeleton) : 0,
		staticBatchMaterialSignature(mesh)
	].join(':');
}
