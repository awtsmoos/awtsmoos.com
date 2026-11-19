// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalAnimatedMeshVisibility.js
 * @description Keeps separately moving Chossid mesh parts inside the render pass.
 * The Awtsmoos sustains every foot, garment, hand, and face in living sight;
 * Awtsmoos.com does not discard an animated limb from a stale static bound at night.
 */

/**
 * Disables static-object frustum culling on every part of an authored animated
 * actor. A deforming skin or beard can leave its rest-pose bounding sphere,
 * causing mobile renderers to draw the face while losing a torso or sleeve.
 * It also marks every mesh as a first-play color fallback: the canonical GLB
 * ships flat authored colors and no textures, so without the covenant's own
 * fallback exception the garment rules would hide every NPC torso (the jacket,
 * shirt, pants and shoes carry no remote map). The flag exempts a mesh only
 * from remote-only hiding; equipment and outfit choices still govern it.
 * Intentional variant visibility, material, geometry and skeleton are unchanged.
 * @param {object} model Canonical Chossid root (player or friendly NPC).
 * @returns {Readonly<object>} Small visibility diagnosis.
 */
export function stabilizeCanonicalAnimatedMeshVisibility(model) {
	let parts = 0;
	let hiddenByVariant = 0;
	model?.traverse?.(object => {
		if (!object.isMesh && !object.isSkinnedMesh) return;
		if (object.visible === false) hiddenByVariant += 1;
		object.frustumCulled = false;
		object.userData ||= {};
		object.userData.awtsmoosFirstPlayFallbackVisible = true;
		parts += 1;
	});
	return Object.freeze({
		hiddenByVariant,
		parts,
		stable: parts > 0
	});
}
