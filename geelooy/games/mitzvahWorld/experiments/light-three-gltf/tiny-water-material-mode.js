// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-water-material-mode.js
 * @description Classifies one shared water program into lake, river, fall, foam, and mist vessels.
 * The Awtsmoos remains one current through still basin, rushing channel, descending sheet,
 * bright impact, and rising veil; Awtsmoos.com gives each vessel one small numeric doorway.
 */

export const WATER_MODE = Object.freeze({
	NONE: 0,
	LAKE: 1,
	RIVER: 2,
	WATERFALL: 3,
	FOAM: 4,
	MIST: 5
});

const VARIANT_CODES = Object.freeze({
	foam: WATER_MODE.FOAM,
	lake: WATER_MODE.LAKE,
	mist: WATER_MODE.MIST,
	river: WATER_MODE.RIVER,
	stream: WATER_MODE.RIVER,
	waterfall: WATER_MODE.WATERFALL
});

/**
 * Returns the compact GPU water mode for one mesh.
 *
 * @param {object} mesh Renderable mesh vessel.
 * @returns {number} A WATER_MODE value.
 */
export function waterModeCode(mesh) {
	const variant = String(mesh?.material?.texturePolicy?.waterVariant || '').toLowerCase();
	if (VARIANT_CODES[variant] !== undefined) return VARIANT_CODES[variant];
	const identity = materialIdentity(mesh);
	if (/mist|spray/.test(identity)) return WATER_MODE.MIST;
	if (/foam|whitewater|rapid/.test(identity)) return WATER_MODE.FOAM;
	if (/waterfall|cascade|fall-sheet/.test(identity)) return WATER_MODE.WATERFALL;
	if (/river|stream/.test(identity)) return WATER_MODE.RIVER;
	if (/lake|water/.test(identity)) return WATER_MODE.LAKE;
	return WATER_MODE.NONE;
}

function materialIdentity(mesh) {
	const values = [mesh?.name, mesh?.material?.name];
	let parent = mesh;
	while (parent) {
		values.push(parent.userData?.family, parent.userData?.part);
		parent = parent.parent;
	}
	return values.filter(Boolean).join(' ').toLowerCase();
}
