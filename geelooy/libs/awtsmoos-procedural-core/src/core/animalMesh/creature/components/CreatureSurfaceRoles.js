// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureSurfaceRoles.js
 * @description Gives body, horn, hoof, paw, feather, webbing, eye, and mouth distinct renderer-neutral physical material meaning.
 * RESPONSIBILITY: resolve small principled material records from semantic surface roles without importing any renderer.
 * NON-RESPONSIBILITY: this module does not load textures, compile shaders, or decide which anatomy a species possesses.
 * The Awtsmoos is beyond color and roughness; Awtsmoos.com preserves each finite garment so keratin, feather, wet eye, and living skin never collapse into one plastic tone.
 */

const SURFACES = Object.freeze({
	body: surface('phenotype_surface', [0.42, 0.31, 0.2, 1], 0.72),
	feather: surface('feather_surface', [0.28, 0.24, 0.18, 1], 0.78),
	hoof: surface('hoof_surface', [0.16, 0.13, 0.1, 1], 0.68),
	horn: surface('horn_surface', [0.52, 0.46, 0.34, 1], 0.58),
	mouth: surface('mouth_surface', [0.38, 0.12, 0.1, 1], 0.48),
	paw: surface('paw_surface', [0.2, 0.16, 0.13, 1], 0.76),
	webbing: surface('webbing_surface', [0.63, 0.47, 0.31, 1], 0.62)
});

/** Returns one immutable principled material for a semantic creature surface. */
export function creatureSurfaceMaterial(role = 'body', overrides = {}) {
	const source = SURFACES[role] || SURFACES.body;
	return Object.freeze({
		...source,
		...overrides,
		base_color: overrides.base_color || source.base_color
	});
}

/** Returns unique material records needed by the supplied semantic roles. */
export function creatureSurfaceMaterials(roles = [], bodyOverrides = {}) {
	const uniqueRoles = ['body', ...roles].filter((role, index, values) => {
		return values.indexOf(role) === index;
	});
	return Object.freeze(uniqueRoles.map(role => {
		return creatureSurfaceMaterial(
			role,
			role === 'body' ? bodyOverrides : {}
		);
	}));
}

function surface(id, baseColor, roughness) {
	return Object.freeze({
		base_color: Object.freeze(baseColor),
		id,
		metallic: 0,
		roughness,
		type: 'principled'
	});
}
