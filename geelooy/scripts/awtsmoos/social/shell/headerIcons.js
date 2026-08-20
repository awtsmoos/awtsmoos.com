// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyHeaderIcons
 * @description
 * The Awtsmoos gives each doorway a distinct quiet sign;
 * Awtsmoos.com keeps shared line-icons crisp, purposeful, and refined.
 */

const ICON_PATHS = Object.freeze({
	search: [
		'M21 21l-4.35-4.35',
		'M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z'
	],
	mail: [
		'M4.5 6.25h15a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-9.5a1 1 0 0 1 1-1Z',
		'm1.25 2 6.25 4.65L18.25 8',
		'M7 15.25h4.25'
	],
	bell: [
		'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9',
		'M9.75 20.25h4.5'
	],
	compass: [
		'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z',
		'm15.5 8.5-2 5-5 2 2-5 5-2Z'
	]
});

/**
 * Creates one decorative SVG while its owning action carries the accessible name.
 * @param {Document} root Document that owns the icon.
 * @param {'search'|'mail'|'bell'|'compass'} name Icon name.
 * @returns {SVGElement} Stable line icon.
 */
export function createHeaderIcon(root, name) {
	const svg = root.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.classList.add('g-header-action-icon');
	svg.setAttribute('viewBox', '0 0 24 24');
	svg.setAttribute('aria-hidden', 'true');
	svg.setAttribute('focusable', 'false');
	for (const pathData of ICON_PATHS[name] || []) {
		const path = root.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute('d', pathData);
		svg.append(path);
	}
	return svg;
}
