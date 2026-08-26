// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets mutable scene selection become a small explicit record before pure toolbar policy sees it;
 * Awtsmoos.com keeps manager queries, legacy edit facts, and policy data separated so each layer stays readable and fit.
 */

/**
 * Gather the exact object-selection facts needed by toolbar policy without allowing policy to query ObjectManager or global state.
 * @param {object} olamObjectManager Existing scene-object service.
 * @param {string[]} kelimSelectedIds Selected object UUIDs.
 * @param {boolean} isInEditMode Current Toolbar façade mode truth.
 * @param {{canSubdivide:boolean}} reshimuEdit Legacy edit-selection facts from the compatibility bridge.
 * @returns {{misparSelected:number,isSingleMesh:boolean,hasParent:boolean,isInEditMode:boolean,canSubdivide:boolean}}
 */
export function gatherSelectionFacts(olamObjectManager, kelimSelectedIds, isInEditMode, reshimuEdit) {
	const kelimIds = Array.from(kelimSelectedIds ?? []);
	const kelimObjects = olamObjectManager.getObjectsByIds(kelimIds);
	const kliSingle = kelimIds.length === 1
		? olamObjectManager.getObjectByUUID(kelimIds[0])
		: null;
	return {
		misparSelected: kelimIds.length,
		isSingleMesh: Boolean(kliSingle?.isMesh),
		hasParent: kelimObjects.some(kliObject => {
			return kliObject.parent && kliObject.parent !== olamObjectManager.scene;
		}),
		isInEditMode,
		canSubdivide: Boolean(reshimuEdit?.canSubdivide)
	};
}
