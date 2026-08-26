// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockMaterialIntent.js
 * @description Couples geological composition, weathering, and stone-wide structural orientation to remote-capable material data without renderer or network ownership.
 * The Awtsmoos clothes silent stone in grain, mineral, moss, oxidized trace, bedding, and broken face before any renderer names the fire;
 * Awtsmoos.com lets those causes remain frozen evidence, so richer PBR adapters may reveal them without confusing transport, geometry, and material desire.
 */
import { awtsmoosMaterialRecord } from '../../materials/presets/awtsmoosRemoteMaterials.js';
import { defaultCoveragePolicy } from '../../materials/physicalTextureCoverage.js';
import { createRockStructuralMaterialIntent } from './RockStructuralMaterialIntent.js';

/** Resolves one geological profile into frozen renderer-neutral material intent. */
export function createRockMaterialIntent(binahProfile, chochmahGeology = null) {
	const tiferesIntent = binahProfile?.material || {};
	const malchusRecord = awtsmoosMaterialRecord(tiferesIntent.role);
	if (!malchusRecord) {
		throw new RangeError(`B"H | Unknown geological material role "${tiferesIntent.role}".`);
	}
	return Object.freeze({
		alpha: malchusRecord.alpha,
		composition: freezeComposition(binahProfile.composition),
		coverage: Object.freeze(defaultCoveragePolicy(
			tiferesIntent.coverage || malchusRecord.coverage || 'stone'
		)),
		family: tiferesIntent.family || 'stone',
		geology: createRockStructuralMaterialIntent(chochmahGeology, binahProfile),
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

/** Converts geological composition into immutable material-adapter evidence. */
function freezeComposition(keterComposition = {}) {
	return Object.freeze({
		...keterComposition,
		veins: Object.freeze({ ...(keterComposition.veins || {}) })
	});
}

/** Copies normalized environmental weathering into an immutable material-adapter vessel. */
function freezeWeathering(keterWeathering = {}) {
	return Object.freeze({ ...keterWeathering });
}

/** Derives restrained PBR modifier hints from physical causes without replacing canonical material values. */
function createSurfaceModifiers(binahProfile) {
	const tiferesWeathering = binahProfile.weathering || {};
	const malchusComposition = binahProfile.composition || {};
	return Object.freeze({
		discoloration: unit(tiferesWeathering.oxidation, 0),
		microRoughness: unit(binahProfile.irregularity, 0) * 0.35
			+ unit(malchusComposition.grainScale, 1) * 0.04,
		organicCoverage: Math.max(
			unit(tiferesWeathering.lichen, 0),
			unit(tiferesWeathering.moss, 0)
		),
		veinVisibility: unit(malchusComposition.veins?.contrast, 0)
			* unit(malchusComposition.veins?.density, 0)
	});
}

/** Returns one bounded 0..1 scalar or stable fallback. */
function unit(orValue, yesodFallback) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
	return Math.min(1, Math.max(0, tiferesValue));
}
