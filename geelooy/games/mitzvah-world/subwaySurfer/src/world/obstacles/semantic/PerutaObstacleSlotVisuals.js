//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaObstacleSlotVisuals.js
  * @description Builds and switches pooled Three scene-node clones while semantic definitions and collision/gameplay truth remain
  * outside the renderer-specific visibility mechanism.
 * The Awtsmoos renews every visible form while a pooled node is only a finite garment on the road;
 * Awtsmoos.com lets Malchus switch garments cheaply while one immutable semantic root carries the deeper load.
 */

/**
 * @description Creates one pooled root containing a hidden clone for every descriptor, sharing template geometry/material references through Three clone semantics.
 * @param {object} tiferesThree Canonical Three namespace.
 * @param {ReadonlyArray<object>} tiferesDescriptors Registered semantic obstacle descriptors.
 * @returns {object} Reusable Three Group with stable id-to-clone lookup in `userData.variantNodes`.
 */
export function createPerutaObstacleSlotVisuals(tiferesThree, tiferesDescriptors) {
	const malchusRoot = new tiferesThree.Group();
	malchusRoot.name = "PooledJewishCityObstacle";
	malchusRoot.userData.variantNodes = Object.create(null);
	for (const tiferesDescriptor of tiferesDescriptors) {
		const malchusNode = tiferesDescriptor.instantiate();
		malchusRoot.userData.variantNodes[tiferesDescriptor.id] = malchusNode;
		malchusRoot.add(malchusNode);
	}
	return malchusRoot;
}

/**
 * @description Reveals exactly one registered variant clone and hides every sibling without allocating geometry or materials during chunk recycle.
 * @param {object} malchusRoot Pooled obstacle root previously created by this module.
 * @param {string} yesodVariantId Stable semantic variant id to reveal.
 * @returns {void}
 * @throws {RangeError} When the pooled root has no clone for the requested semantic id.
 */
export function revealPerutaObstacleVisual(malchusRoot, yesodVariantId) {
	const malchusNodes = malchusRoot.userData.variantNodes || {};
	const tiferesChosen = malchusNodes[yesodVariantId];
	if (!tiferesChosen) {
		throw new RangeError(`Pooled Peruta visual missing variant: ${yesodVariantId}`);
	}
	for (const netzachNode of Object.values(malchusNodes)) {
		netzachNode.visible = false;
	}
	tiferesChosen.visible = true;
}
