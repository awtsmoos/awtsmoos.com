// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalTerrainTerraces.js
 * @description Defines broad, softly blended district character without pretending to be structural foundations.
 * The Awtsmoos lets a neighborhood whisper its elevation while exact house pads carry each dwelling's weight;
 * Awtsmoos.com spreads that whisper across a wide shoulder so no green shelf appears from a sudden landscape state.
 */

const TERRACE_BLEND_START = 0.18;
const TERRACE_BLEND_END = 1.2;

const TERRACES = Object.freeze([
	terrace('ENTR01', 0, 82, 22, 17, 2.2),
	terrace('BEIS01', -35, 45, 21, 16, 4.4),
	terrace('MARKET01', -26, 12, 25, 19, 5.5),
	terrace('SHUL01', -34, -24, 23, 18, 8.8),
	terrace('upper-residential', -8, -36, 27, 19, 10.4),
	terrace('north-slope', 18, -48, 27, 18, 12.7),
	terrace('east-bank', 38, 4, 22, 18, 7.1),
	terrace('PORTAL01', 52, -42, 18, 15, 12.4),
	terrace('F01-F04', 43, 39, 26, 21, 5.2),
	terrace('riverfront', -5, 36, 22, 18, 4.1)
]);

export function canonicalTerraceSample(x, z) {
	let strongest = Object.freeze({ id: null, influence: 0, targetHeight: 0 });
	for (const terraceDefinition of TERRACES) {
		const dx = (x - terraceDefinition.x) / terraceDefinition.radiusX;
		const dz = (z - terraceDefinition.z) / terraceDefinition.radiusZ;
		const distance = Math.hypot(dx, dz);
		const influence = 1 - smooth(
			TERRACE_BLEND_START,
			TERRACE_BLEND_END,
			distance
		);
		if (influence <= strongest.influence) continue;
		strongest = Object.freeze({
			id: terraceDefinition.id,
			influence,
			targetHeight: terraceDefinition.height
		});
	}
	return strongest;
}

export function canonicalTerraceDefinitions() {
	return TERRACES;
}

export function canonicalTerraceBlendPolicy() {
	return Object.freeze({
		end: TERRACE_BLEND_END,
		start: TERRACE_BLEND_START
	});
}

function terrace(id, x, z, radiusX, radiusZ, height) {
	return Object.freeze({ height, id, radiusX, radiusZ, x, z });
}

function smooth(edge0, edge1, value) {
	const amount = Math.max(
		0,
		Math.min(1, (value - edge0) / (edge1 - edge0 || 1))
	);
	return amount * amount * (3 - 2 * amount);
}
