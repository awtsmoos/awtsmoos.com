// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockFieldPlanner.js
 * @description Plans bounded deterministic stone clusters with exact legacy spacing semantics, spatial acceleration, child seeds, and explicit saturation evidence.
 * The Awtsmoos renews pebble and mountain in one indivisible decree; Awtsmoos.com lets Malchus reveal positions while Gevurah indexes nearby vessels,
 * so larger fields remain deterministic and lawful without an ever-growing quadratic scan through every stone already revealed.
 */
import { RockFieldDiagnostics } from './RockFieldDiagnostics.js';
import { normalizeRockFieldRecipe } from './RockFieldRecipe.js';
import { RockFieldSpatialIndex } from './RockFieldSpatialIndex.js';
import { sampleRockUnit } from './RockNoise.js';

const ATTEMPTS_PER_ROCK = 12;

/** Plans reproducible rock fields without eagerly creating meshes. */
export class RockFieldPlanner {
	/** Creates one bounded placement plan while preserving all historic public fields additively. */
	plan(keterOptions = {}) {
		const chochmahRecipe = normalizeRockFieldRecipe(keterOptions);
		const binahResult = revealPlacements(chochmahRecipe);
		return Object.freeze({
			diagnostics: binahResult.diagnostics,
			placedCount: binahResult.placements.length,
			placements: Object.freeze(binahResult.placements),
			requestedCount: chochmahRecipe.gevurahCount,
			saturated: binahResult.placements.length < chochmahRecipe.gevurahCount,
			seed: chochmahRecipe.yesodSeed
		});
	}
}

/** Executes the exact deterministic candidate sequence with accelerated local spacing lookup. */
function revealPlacements(keterRecipe) {
	const chochmahPlacements = [];
	const binahLimit = keterRecipe.gevurahCount * ATTEMPTS_PER_ROCK;
	const gevurahMaximumScale = keterRecipe.netzachScale[1];
	const tiferesIndex = new RockFieldSpatialIndex(keterRecipe.hodSpacing * gevurahMaximumScale);
	const netzachDiagnostics = new RockFieldDiagnostics(binahLimit);
	for (let hodAttempt = 0; hodAttempt < binahLimit && chochmahPlacements.length < keterRecipe.gevurahCount; hodAttempt += 1) {
		netzachDiagnostics.consider();
		const yesodCandidate = createCandidate(keterRecipe, hodAttempt, chochmahPlacements.length);
		if (!tiferesIndex.canPlace(yesodCandidate, keterRecipe.hodSpacing)) {
			netzachDiagnostics.rejectSpacing();
			continue;
		}
		const malchusPlacement = Object.freeze(yesodCandidate);
		tiferesIndex.insert(malchusPlacement);
		chochmahPlacements.push(malchusPlacement);
	}
	return Object.freeze({
		diagnostics: netzachDiagnostics.finish(keterRecipe.gevurahCount, chochmahPlacements.length),
		placements: chochmahPlacements
	});
}

/** Creates one deterministic clustered polar candidate using the unchanged historic seed channels. */
function createCandidate(keterRecipe, chochmahAttempt, binahAcceptedIndex) {
	const gevurahAngle = sampleRockUnit(keterRecipe.yesodSeed, chochmahAttempt, 1) * Math.PI * 2;
	const tiferesUnit = sampleRockUnit(keterRecipe.yesodSeed, chochmahAttempt, 2);
	const netzachExponent = 1.35 + keterRecipe.chesedCluster * 2.8;
	const hodDistance = keterRecipe.tiferesRadius * Math.pow(tiferesUnit, netzachExponent);
	const yesodScale = keterRecipe.netzachScale[0]
		+ sampleRockUnit(keterRecipe.yesodSeed, chochmahAttempt, 3)
			* (keterRecipe.netzachScale[1] - keterRecipe.netzachScale[0]);
	return {
		position: Object.freeze([
			keterRecipe.malchusCenter[0] + Math.cos(gevurahAngle) * hodDistance,
			keterRecipe.malchusCenter[1],
			keterRecipe.malchusCenter[2] + Math.sin(gevurahAngle) * hodDistance
		]),
		scale: yesodScale,
		seed: (keterRecipe.yesodSeed ^ Math.imul(binahAcceptedIndex + 1, 0x9e3779b1)) >>> 0,
		yaw: sampleRockUnit(keterRecipe.yesodSeed, chochmahAttempt, 4) * Math.PI * 2
	};
}
