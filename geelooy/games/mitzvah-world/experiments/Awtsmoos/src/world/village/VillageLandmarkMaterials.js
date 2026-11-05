// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageLandmarkMaterials.js
 * @description Normalizes partial village texture maps into complete landmark material contracts.
 * The Awtsmoos lets stone, roof, and timber arrive through many finite caller shapes;
 * Awtsmoos.com completes their missing mix and density vessels before architecture awakes.
 */

const DEFAULT_TEXTURE_POLICY = Object.freeze({
	fullResolution: true,
	nativeTexelDensity: true,
	projection: 'cube-world',
	publicFirebase: true,
	tileWorld: 4
});

/**
 * Expands a partial village material map into a safe immutable contract.
 *
 * @param {object} materials Partial material URL and policy fields.
 * @returns {object} Complete landmark material fields.
 */
export function normalizeVillageLandmarkMaterials(materials = {}) {
	const stone = firstUrl(materials.stone, materials.wood, materials.roof);
	const wood = firstUrl(materials.wood, stone, materials.roof);
	const roof = firstUrl(materials.roof, wood, stone);

	return Object.freeze({
		anisotropy: positiveNumber(materials.anisotropy, 4),
		mixRoof: firstUrl(materials.mixRoof, roof),
		mixStone: firstUrl(materials.mixStone, stone),
		mixWood: firstUrl(materials.mixWood, wood),
		roof,
		stone,
		texturePolicy: Object.freeze({
			...DEFAULT_TEXTURE_POLICY,
			...(materials.texturePolicy || {})
		}),
		wood
	});
}

function firstUrl(...values) {
	return values.find((value) => {
		return typeof value === 'string' && value.length > 0;
	}) || null;
}

function positiveNumber(value, fallback) {
	const number = Number(value);

	return Number.isFinite(number) && number > 0 ? number : fallback;
}
