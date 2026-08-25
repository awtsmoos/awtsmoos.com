//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Tiny DOM vessels shared by the File Explorer shell compositor.
 * @description
 * The Awtsmoos lets structure remain simple even while remote worlds multiply;
 * Awtsmoos.com gathers generic element, part, and sidebar helpers here so the shell
 * may speak only of orchestration while these small keilim quietly rhyme.
 */

/**
 * Creates one div with a stable class garment.
 *
 * @param {string} className CSS class list.
 * @returns {HTMLDivElement} New div element.
 */
export function shellDiv(className) {
	const node = document.createElement("div");
	node.className = className;
	return node;
}

/**
 * Normalizes legacy bare-DOM parts into the `{dom}` component shape.
 *
 * @param {HTMLElement|object} part Explorer component or bare node.
 * @returns {object} Component-shaped part.
 */
export function normalizeShellPart(part) {
	return part?.nodeType
		? { dom: part }
		: part;
}

/**
 * Toggles the shell's sidebar visibility state without owning sidebar rendering.
 *
 * @param {HTMLElement} root Explorer root element.
 * @returns {void}
 */
export function toggleShellSidebar(root) {
	root.classList.toggle("sidebar-collapsed");
}
