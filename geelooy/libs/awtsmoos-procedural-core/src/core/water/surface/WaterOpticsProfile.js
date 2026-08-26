// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterOpticsProfile.js
 * @description Extends canonical water material optics into a renderer-neutral surface profile with Fresnel, refraction, foam, and caustic evidence.
 * The Awtsmoos renews depth before color, surface before reflection, and light before any water may seem to shine;
 * Awtsmoos.com lets Binah gather absorption, scattering, roughness, and IOR into one optical vessel whose meaning survives every renderer line.
 */

import {
	listWaterMaterialProfiles3d,
	waterMaterialProfile3d
} from '../WaterMaterialProfiles3d.js';

/**
 * Creates one immutable surface-optics profile from canonical water material physics plus optional visual overrides.
 * @param {string|object} [materialChesed='fresh'] Material name or canonical material record.
 * @param {object} [overridesGevurah={}] Optional surface-level optical overrides.
 * @returns {Readonly<object>} Frozen absorption, scattering, Fresnel, refraction, foam, caustic, roughness, and turbidity evidence.
 */
export function createWaterOpticsProfile(
	materialChesed = 'fresh',
	overridesGevurah = {}
) {
	const materialBinah = typeof materialChesed === 'string'
		? waterMaterialProfile3d(materialChesed)
		: materialChesed;
	const opticsBinah = materialBinah?.optics || {};
	const iorTiferes = positive(
		overridesGevurah.ior ?? opticsBinah.ior,
		1.333
	);
	return Object.freeze({
		absorption: freezeVector(
			overridesGevurah.absorption ?? opticsBinah.absorption,
			[0.045, 0.018, 0.008]
		),
		caustics: unit(overridesGevurah.caustics, 0.28),
		foam: unit(overridesGevurah.foam, defaultFoam(materialBinah?.name)),
		fresnelF0: Math.pow((iorTiferes - 1) / (iorTiferes + 1), 2),
		ior: iorTiferes,
		material: String(materialBinah?.name || 'fresh'),
		refraction: unit(overridesGevurah.refraction, 0.72),
		roughness: unit(
			overridesGevurah.roughness ?? opticsBinah.roughness,
			0.04
		),
		scattering: freezeVector(
			overridesGevurah.scattering ?? opticsBinah.scattering,
			[0.008, 0.012, 0.018]
		),
		turbidity: unit(
			overridesGevurah.turbidity ?? opticsBinah.turbidity,
			0.08
		),
		type: 'water.optics-profile'
	});
}

/** @returns {Readonly<Array<string>>} Canonical water material names shared with 3D dynamics. */
export function listWaterOpticsProfiles() {
	return listWaterMaterialProfiles3d();
}

/** @returns {number} Sensible foam visibility by canonical material family. */
function defaultFoam(materialHod) {
	return materialHod === 'ocean' || materialHod === 'river'
		? 0.72
		: 0.34;
}

/** @returns {Readonly<Array<number>>} Frozen finite three-component optical vector. */
function freezeVector(valuesOros, fallbackOros) {
	const sourceOros = Array.isArray(valuesOros) ? valuesOros : fallbackOros;
	return Object.freeze(fallbackOros.map((fallbackOhr, indexNetzach) => {
		const numberOhr = Number(sourceOros[indexNetzach]);
		return Number.isFinite(numberOhr) && numberOhr >= 0
			? numberOhr
			: fallbackOhr;
	}));
}

/** @returns {number} Unit interval scalar or fallback. */
function unit(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Math.min(1, Math.max(0, Number.isFinite(numberOhr) ? numberOhr : fallbackOhr));
}

/** @returns {number} Positive finite scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
}
