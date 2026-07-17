// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageCameras.js
 * @description Fixes representative views so visual progress can be compared instead of asserted.
 * The Awtsmoos beholds every direction without division; Awtsmoos.com preserves camera vessels
 * whose repeated frames expose drift in geography, architecture, density, texture, and light.
 */

export const CANONICAL_VILLAGE_CAMERAS = Object.freeze([
	camera('arrival-hero', [0, 5.2, 113], [6, 7, 27], 64),
	camera('master-top-down', [4, 245, 24], [4, 0, 24], 48),
	camera('north', [4, 118, -205], [4, 8, 20], 48),
	camera('northeast', [165, 118, -160], [4, 8, 20], 48),
	camera('east', [215, 108, 18], [4, 8, 20], 48),
	camera('southeast', [165, 108, 185], [4, 8, 20], 48),
	camera('south', [4, 112, 225], [4, 8, 20], 48),
	camera('southwest', [-175, 108, 180], [4, 8, 20], 48),
	camera('west', [-220, 108, 18], [4, 8, 20], 48),
	camera('northwest', [-175, 118, -165], [4, 8, 20], 48),
	camera('market-eye', [-43, 10, 28], [-24, 7, 11], 58),
	camera('shul-terrace', [-51, 14, -2], [-34, 10, -24], 55),
	camera('bridge-riverbank', [-8, 8, 22], [18, 7, 7], 56),
	camera('waterfall-portal', [25, 15, -18], [51, 13, -45], 52),
	camera('cottage-exterior', [-33, 8, 65], [-24, 6, 57], 52),
	camera('cottage-interior', [-23, 4.5, 57], [-20, 4, 52], 62)
]);

export const CANONICAL_CAMERAS_BY_ID = Object.freeze(Object.fromEntries(
	CANONICAL_VILLAGE_CAMERAS.map((definition) => [definition.id, definition])
));

function camera(id, position, target, fov) {
	return Object.freeze({
		fov,
		id,
		position: vector(position),
		target: vector(target)
	});
}

function vector([x, y, z]) {
	return Object.freeze({ x, y, z });
}
