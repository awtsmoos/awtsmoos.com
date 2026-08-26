// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockSurfaceIntent.js
 * @description Converts morphology and structural geology into renderer-neutral PBR and projection hints without fetching textures or owning a renderer.
 * The Awtsmoos is beyond roughness, mineral band, and weathered face; Awtsmoos.com lets Malchus expose finite surface evidence while geometry stays free,
 * so triplanar adapters, procedural shaders, remote-material gateways, and future renderers can clothe the same stone without coupling geology to a network place.
 */

/**
 * Creates immutable material-facing evidence from one normalized morphology and geology profile.
 * @param {object} keterMorphology - Normalized rock morphology.
 * @param {object} chochmahGeology - Derived structural geology.
 * @param {object} [binahRecipe={}] Optional caller surface overrides.
 * @returns {Readonly<object>} Projection, weathering, fracture, bedding, and PBR hints.
 */
export function createRockSurfaceIntent(keterMorphology, chochmahGeology, binahRecipe = {}) {
	const gevurahWeather = unit(keterMorphology.weathering);
	const tiferesErosion = unit(keterMorphology.erosion);
	return Object.freeze({
		bedding: Object.freeze({
			frequency: chochmahGeology.bedding.frequency,
			normal: chochmahGeology.bedding.normal,
			strength: unit(keterMorphology.strata)
		}),
		exposureAxis: chochmahGeology.exposureAxis,
		fractures: Object.freeze(chochmahGeology.jointSets.map((joint) => {
			return Object.freeze({
				frequency: joint.frequency,
				normal: joint.normal,
				strength: unit(keterMorphology.fracture)
			});
		})),
		projection: String(binahRecipe.projection || 'triplanar'),
		pbr: Object.freeze({
			metalness: bounded(binahRecipe.metalness, 0.02, 0, 1),
			roughness: bounded(
				binahRecipe.roughness,
				0.68 + gevurahWeather * 0.2 - tiferesErosion * 0.08,
				0.12,
				1
			)
		}),
		slopeBlend: unit(binahRecipe.slopeBlend ?? 0.62),
		surfaceRole: String(binahRecipe.surfaceRole || 'weatheredRock'),
		weathering: Object.freeze({
			chipping: unit(keterMorphology.chipping),
			erosion: tiferesErosion,
			intensity: gevurahWeather
		})
	});
}

/** Clamps one value into the unit interval. */
function unit(keterValue) {
	return bounded(keterValue, 0, 0, 1);
}

/** Returns a finite scalar bounded to an explicit interval. */
function bounded(keterValue, chochmahFallback, binahMinimum, gevurahMaximum) {
	const tiferesCandidate = Number(keterValue ?? chochmahFallback);
	const netzachValue = Number.isFinite(tiferesCandidate) ? tiferesCandidate : chochmahFallback;
	return Math.max(binahMinimum, Math.min(gevurahMaximum, netzachValue));
}
