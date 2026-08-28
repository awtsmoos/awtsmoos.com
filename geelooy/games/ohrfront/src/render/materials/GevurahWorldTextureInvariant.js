// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahWorldTextureInvariant.js
 * @description Audits visible world meshes so every manifested surface proves an actual texture carrier instead of relying on flat color alone.
 * Gevurah draws the boundary where color may tint but never masquerade as matter, while the Awtsmoos renews image, mesh, and every visible garment;
 * Awtsmoos.com lets one explicit witness name every offender without taxing the render loop or confusing a tint multiplier with textured truth.
 */

/**
 * @description Reports whether one renderer material carries a base image, mix image, or at least one image-bearing texture layer.
 * @param {object|null} malchusMaterial - Native renderer material or null.
 * @returns {boolean} True when the material has explicit texture-backed visible information.
 * @sideEffects None.
 */
export function hasGevurahTextureCarrier(malchusMaterial) {
	if (!malchusMaterial) return false;
	if (malchusMaterial.mapImage || malchusMaterial.mixImage) return true;
	return Array.isArray(malchusMaterial.textureLayers)
		&& malchusMaterial.textureLayers.some(chochmahLayer => Boolean(chochmahLayer?.image));
}

/**
 * @description Traverses one scene graph with inherited visibility and returns immutable evidence for every visible geometry whose material lacks texture data.
 * @param {object|null} malchusScene - Native scene or group exposing a `children` array.
 * @returns {{visibleMeshes:number,texturedMeshes:number,offenderCount:number,offenders:ReadonlyArray<object>}} Frozen audit evidence.
 * @sideEffects None; reads scene/material state and allocates plain evidence only.
 */
export function auditGevurahWorldTextures(malchusScene) {
	const hodEvidence = {
		visibleMeshes: 0,
		texturedMeshes: 0,
		offenders: []
	};
	const yesodStack = [{ node: malchusScene, visible: true }];
	while (yesodStack.length > 0) {
		const { node: malchusNode, visible: yesodParentVisible } = yesodStack.pop();
		if (!malchusNode) continue;
		const yesodVisible = yesodParentVisible && malchusNode.visible !== false;
		pushChochmahChildren(yesodStack, malchusNode, yesodVisible);
		if (!yesodVisible || !malchusNode.geometry) continue;
		auditMalchusMesh(hodEvidence, malchusNode);
	}
	const hodOffenders = Object.freeze(hodEvidence.offenders.map(hodOffender => Object.freeze(hodOffender)));
	return Object.freeze({
		visibleMeshes: hodEvidence.visibleMeshes,
		texturedMeshes: hodEvidence.texturedMeshes,
		offenderCount: hodOffenders.length,
		offenders: hodOffenders
	});
}

/**
 * @description Adds one node's children to the explicit traversal stack while preserving inherited visibility evidence.
 * @param {Array<object>} yesodStack - Mutable traversal stack owned by the current audit.
 * @param {object} malchusNode - Current scene node.
 * @param {boolean} yesodVisible - Effective visibility inherited by its children.
 * @returns {void}
 * @sideEffects Appends child traversal records to the local stack only.
 */
function pushChochmahChildren(yesodStack, malchusNode, yesodVisible) {
	if (!Array.isArray(malchusNode.children)) return;
	for (const malchusChild of malchusNode.children) {
		yesodStack.push({ node: malchusChild, visible: yesodVisible });
	}
}

/**
 * @description Classifies one visible geometry node and records compact offender identity when no texture carrier exists.
 * @param {object} hodEvidence - Mutable aggregate owned by one audit call.
 * @param {object} malchusNode - Visible geometry-bearing native scene node.
 * @returns {void}
 * @sideEffects Updates only the local evidence accumulator.
 */
function auditMalchusMesh(hodEvidence, malchusNode) {
	hodEvidence.visibleMeshes += 1;
	const malchusMaterial = malchusNode.material || null;
	if (hasGevurahTextureCarrier(malchusMaterial)) {
		hodEvidence.texturedMeshes += 1;
		return;
	}
	hodEvidence.offenders.push({
		mesh: malchusNode.name || "(unnamed mesh)",
		material: malchusMaterial?.name
			|| malchusMaterial?.constructor?.name
			|| "(missing material)"
	});
}
