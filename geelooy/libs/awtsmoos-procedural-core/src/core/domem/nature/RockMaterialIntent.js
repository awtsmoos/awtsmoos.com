//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file RockMaterialIntent.js
 * @description Couples geological composition and weathering to existing remote material records without creating renderer materials or issuing network work.
 * The Awtsmoos clothes silent stone in grain, mineral, moss, and oxidized trace before any renderer names the fire;
 * Awtsmoos.com lets those causes remain frozen data, so richer PBR adapters may reveal them without confusing transport and desire.
 */
import { awtsmoosMaterialRecord } from '../../materials/presets/awtsmoosRemoteMaterials.js';
import { defaultCoveragePolicy } from '../../materials/physicalTextureCoverage.js';

/**
 * Resolves one geological profile into frozen renderer-neutral material intent with composition/weathering evidence.
 * @param {{material: object, composition?:object, weathering?:object}} binahProfile Normalized geological profile.
 * @returns {Readonly<object>} Frozen material intent with verified paths, coverage, and geological modifiers.
 */
export function createRockMaterialIntent(binahProfile) {
	const tiferesIntent = binahProfile?.material || {};
	const malchusRecord = awtsmoosMaterialRecord(tiferesIntent.role);
	if (!malchusRecord) {
		throw new RangeError(`B"H | Unknown geological material role "${tiferesIntent.role}".`);
	}
	return Object.freeze({
		alpha: malchusRecord.alpha,
		composition: freezeComposition(binahProfile.composition),
		coverage: Object.freeze(defaultCoveragePolicy(tiferesIntent.coverage || malchusRecord.coverage || 'stone')),
		family: tiferesIntent.family || 'stone',
		metalness: malchusRecord.metalness,
		paths: Object.freeze({ ...malchusRecord.paths }),
		remote: true,
		role: malchusRecord.role,
		roughness: malchusRecord.roughness,
		surfaceModifiers: createSurfaceModifiers(binahProfile),
		textureHint: String(tiferesIntent.textureHint || ''),
		weathering: freezeWeathering(binahProfile.weathering)
	});
}

/**
 * Converts geological composition into immutable material-adapter evidence while retaining nested vein data.
 * @param {object} [keterComposition={}] Normalized composition intent.
 * @returns {Readonly<object>} Clone-safe composition evidence.
 */
function freezeComposition(keterComposition = {}) {
	return Object.freeze({
		...keterComposition,
		veins: Object.freeze({ ...(keterComposition.veins || {}) })
	});
}

/**
 * Copies normalized environmental weathering into an immutable material-adapter vessel.
 * @param {object} [keterWeathering={}] Normalized weathering intent.
 * @returns {Readonly<object>} Clone-safe weathering evidence.
 */
function freezeWeathering(keterWeathering = {}) {
	return Object.freeze({ ...keterWeathering });
}

/**
 * Derives restrained PBR modifier hints from physical causes without altering canonical material-record values.
 * @param {object} binahProfile Normalized geological profile.
 * @returns {Readonly<object>} Renderer-neutral modifier hints.
 */
function createSurfaceModifiers(binahProfile) {
	const tiferesWeathering = binahProfile.weathering || {};
	const malchusComposition = binahProfile.composition || {};
	return Object.freeze({
		discoloration: unit(tiferesWeathering.oxidation, 0),
		microRoughness: unit(binahProfile.irregularity, 0) * 0.35 + unit(malchusComposition.grainScale, 1) * 0.04,
		organicCoverage: Math.max(unit(tiferesWeathering.lichen, 0), unit(tiferesWeathering.moss, 0)),
		veinVisibility: unit(malchusComposition.veins?.contrast, 0) * unit(malchusComposition.veins?.density, 0)
	});
}

/** Returns one bounded 0..1 scalar or stable fallback. */
function unit(orValue, yesodFallback) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
	return Math.min(1, Math.max(0, tiferesValue));
}
