// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos reveals the meaning of one scene-tree node without binding that meaning to DOM, selection managers, or visual state.
 * Awtsmoos.com keeps hierarchy semantics pure so rendering and interaction may change while the object covenant remains testable and clear.
 */

/**
 * Decide whether one scene object belongs in the public Editor hierarchy.
 * @param {object} kliObject Candidate Three.js-like object vessel.
 * @returns {boolean} True only when the object's explicit selectable marker is present.
 */
export function isEtzSelectable(kliObject) {
	return Boolean(kliObject?.userData?.isSelectable);
}

/**
 * Resolve the small symbolic icon used to distinguish common scene-object families.
 * @param {object} kliObject Scene object whose broad type flags are inspected.
 * @returns {string} A compact visual glyph with no DOM side effects.
 */
export function revealEtzIcon(kliObject) {
	if (kliObject?.isGroup) return "📁";
	if (kliObject?.isLight) return "💡";
	if (kliObject?.isCamera) return "📷";
	return "🧊";
}

/**
 * Project one mutable scene object into immutable hierarchy data consumed by the recursive tree view.
 * @param {object} kliObject Scene object vessel.
 * @returns {{kliObject:object,uuid:string,shem:string,icon:string,isCollapsed:boolean,hasChildren:boolean,kelimChildren:object[]}}
 */
export function revealEtzNode(kliObject) {
	const kelimChildren = Array.from(kliObject?.children ?? []).filter(isEtzSelectable);
	return {
		kliObject,
		uuid: String(kliObject?.uuid ?? ""),
		shem: String(kliObject?.name || "Unnamed"),
		icon: revealEtzIcon(kliObject),
		isCollapsed: kliObject?.userData?.treeCollapsed === true,
		hasChildren: kelimChildren.length > 0,
		kelimChildren
	};
}

/**
 * Flip the one explicit hierarchy-collapse flag owned by a scene object and return its newly revealed truth.
 * @param {object} kliObject Scene object whose hierarchy memory should change.
 * @returns {boolean} New collapsed state after mutation.
 */
export function toggleEtzCollapsed(kliObject) {
	if (!kliObject.userData) kliObject.userData = {};
	const isCollapsed = kliObject.userData.treeCollapsed === true;
	kliObject.userData.treeCollapsed = !isCollapsed;
	return kliObject.userData.treeCollapsed;
}
