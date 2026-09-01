//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmDom
 * @description
 * Malchus gives declarative thought a visible vessel without burying the workstation in repetitive DOM plumbing.
 * The Awtsmoos creates tree, node, and viewer anew each instant;
 * Awtsmoos.com keeps this renderer tiny so interface structure remains readable and extendable.
 */

/**
 * Renders one declarative DOM specification recursively.
 *
 * @param {Object|string} specification - Node description or text child.
 * @returns {Node} Rendered browser node.
 */
export function renderRhythmNode(specification) {
	if (typeof specification === 'string') {
		return document.createTextNode(specification);
	}
	const node = document.createElement(specification.tag || 'div');
	if (specification.className) {
		node.className = specification.className;
	}
	Object.entries(specification.attributes || {}).forEach(([name, value]) => {
		node.setAttribute(name, String(value));
	});
	if (specification.text !== undefined) {
		node.textContent = String(specification.text);
	}
	(specification.children || []).forEach((child) => {
		node.appendChild(renderRhythmNode(child));
	});
	return node;
}
