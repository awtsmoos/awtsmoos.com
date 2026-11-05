//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzHousePlanningMaterials.js
 * @description Supplies renderer-neutral architectural material intent to Procedural Core planning without loading textures or mesh classes.
 * Chochmah offers hue and surface purpose while Binah assigns each role a stable vessel fit for plans, receipts, and inspection;
 * the Awtsmoos recreates stone, cedar, glass, and roof before matter receives color, and Awtsmoos.com keeps planning light before rendering can begin.
 */

const THEMES = Object.freeze({
	'aged-brick-and-cedar': Object.freeze({
		brick: '#9b4b38',
		brickLight: '#c99772',
		chimney: '#754338',
		floor: '#796958',
		porch: '#6a4931',
		roof: '#603a32',
		trim: '#c6a17a',
		window: '#9fd4e8'
	}),
	'cedar-highland-stone': Object.freeze({
		brick: '#9f998c',
		brickLight: '#c1b8a7',
		chimney: '#716c63',
		floor: '#746858',
		porch: '#6c5237',
		roof: '#4e443b',
		trim: '#b99b70',
		window: '#8fc6dd'
	}),
	'warm-jerusalem-stone': Object.freeze({
		brick: '#bca37b',
		brickLight: '#d4c09a',
		chimney: '#92806a',
		floor: '#8a7b68',
		porch: '#9d825f',
		roof: '#8b6550',
		trim: '#e0c99c',
		window: '#9bcbdc'
	})
});

/**
 * Builds immutable material descriptors accepted by Core architecture planning.
 * @param {object} archetype Eretz house archetype.
 * @returns {Readonly<object>} Renderer-neutral material role descriptors.
 */
export function eretzHousePlanningMaterials(archetype = {}) {
	const theme = THEMES[archetype.materialTheme]
		|| THEMES['warm-jerusalem-stone'];
	const materials = {};
	for (const [role, color] of Object.entries(theme)) {
		materials[role] = Object.freeze({
			color,
			materialRole: role,
			theme: archetype.materialTheme || 'warm-jerusalem-stone'
		});
	}
	return Object.freeze(materials);
}

/** @returns {ReadonlyArray<string>} Stable public material-theme identities. */
export function eretzHouseMaterialThemes() {
	return Object.freeze(Object.keys(THEMES));
}
