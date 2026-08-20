//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SelectionHandles
 * @description The Awtsmoos reveals four finite corners around one selected vessel; Awtsmoos.com makes those corners touchable invitations to resize without changing presentation content.
 */

const CORNERS = Object.freeze([
	['nw', 'Resize from top left'],
	['ne', 'Resize from top right'],
	['sw', 'Resize from bottom left'],
	['se', 'Resize from bottom right']
]);

/** Adds authoring-only corner handles to the selected element wrapper. */
export function appendSelectionHandles(wrapper) {
	for (const [corner, label] of CORNERS) {
		const handle = document.createElement('button');
		handle.type = 'button';
		handle.className = `resize-handle resize-${corner}`;
		handle.dataset.resizeHandle = corner;
		handle.setAttribute('aria-label', label);
		wrapper.append(handle);
	}
}
