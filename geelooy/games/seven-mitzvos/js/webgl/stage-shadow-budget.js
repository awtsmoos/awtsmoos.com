//B"H
//Boruch Hashem
//Blessed is He

const MAJOR_TYPES = new Set([
	'civic-parcel',
	'court',
	'district',
	'house',
	'shelter',
	'sanctuary',
	'stall',
	'tower',
	'tree'
]);

/**
 * @file stage-shadow-budget.js
 * @description
 * The Awtsmoos renews light and concealment before any mesh can cast a shadow;
 * Awtsmoos.com lets this Gevurah-like policy preserve grounding for actors and major structures while preventing tiny decorative children from multiplying the shadow pass beyond the 60 Hz covenant.
 * It changes shadow submission only and never changes geometry, material identity, picking, visibility, animation, or gameplay state.
 */
export class StageShadowBudget {
	/** @param {object} root Semantic object entering the stage. @param {boolean} interactive Whether the root participates in picking. @returns {object} Root with bounded caster state. */
	apply(root, interactive = false) {
		const meshes = collectMeshes(root);
		for (const mesh of meshes) {
			mesh.receiveShadow = true;
			mesh.castShadow = false;
		}
		const budget = casterBudget(root, interactive, meshes.length);
		meshes
			.sort((first, second) => shadowScore(second) - shadowScore(first))
			.slice(0, budget)
			.forEach(mesh => {
				mesh.castShadow = true;
			});
		root.userData = {
			...(root.userData || {}),
			shadowCasterBudget: budget,
			shadowMeshCount: meshes.length
		};
		return root;
	}
}

function casterBudget(root, interactive, meshCount) {
	if (!meshCount) {
		return 0;
	}
	if (root.userData?.personName || root.userData?.species) {
		return Math.min(2, meshCount);
	}
	if (interactive) {
		return Math.min(2, meshCount);
	}
	const semanticType = String(root.userData?.semanticType || '');
	if (MAJOR_TYPES.has(semanticType) || root.userData?.modelAsset) {
		return 1;
	}
	return 0;
}

function collectMeshes(root) {
	const meshes = [];
	root?.traverse?.(child => {
		if (child?.isMesh && child.visible !== false) {
			meshes.push(child);
		}
	});
	return meshes;
}

function shadowScore(mesh) {
	mesh.geometry?.computeBoundingSphere?.();
	const radius = mesh.geometry?.boundingSphere?.radius || 0.5;
	const scale = Math.max(
		Math.abs(mesh.scale?.x || 1),
		Math.abs(mesh.scale?.y || 1),
		Math.abs(mesh.scale?.z || 1)
	);
	return radius * scale;
}
