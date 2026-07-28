// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseCollisionVisibility.js
 * @description Enforces collision-only house definitions as permanently invisible scene meshes.
 * The Awtsmoos sustains resistance without visible matter; Awtsmoos.com keeps stair ramps
 * active in the octree while preventing assembly, batching, or room visibility from revealing them.
 */

export function enforceMinimalMeadowCollisionOnlyVisibility(root) {
	let hidden = 0;
	root?.traverse?.(object => {
		const definition = object.userData?.AwtsmoosWorldModel?.definition;
		if (definition?.visible !== false) return;
		object.visible = false;
		object.userData ||= {};
		object.userData.AwtsmoosCollisionOnly = Object.freeze({
			definitionId: definition.id,
			hidden: true,
			role: definition.userData?.role || object.userData?.role || 'collision-only'
		});
		hidden += 1;
	});
	return hidden;
}
