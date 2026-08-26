// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahPopulationAcceptance.js
 * @description Judges renderer-neutral natural-world candidates against runtime exclusion, ecological ranges, environmental score, and minimum-spacing law without contaminating authored recipes with callbacks.
 * Gevurah receives every candidate at the boundary while the Awtsmoos renews acceptance, rejection, slope, moisture, and measured ground;
 * Awtsmoos.com lets world intent remain pure data as runtime reality decides where each finite form may safely be found.
 */

/**
 * Evaluates one candidate against generic exclusion/spacing and optional vegetation ecology samplers.
 * @param {object} chochmahRecipe - Normalized plain natural-world recipe.
 * @param {{x:number,y:number,z:number}} malchusPosition - Candidate position after optional terrain height projection.
 * @param {readonly object[]} yesodAccepted - Previously accepted placement records used for spacing checks.
 * @param {object} [tiferesContext={}] Runtime samplers such as slopeAt, moistureAt, environmentScore, and isExcluded.
 * @returns {{accepted:boolean,environmentScore:number,slope:number|null,moisture:number|null}} Frozen acceptance evidence.
 * @sideEffects Calls supplied runtime samplers but never mutates recipe or accepted placements.
 */
export function evaluateGevurahPopulationCandidate(
	chochmahRecipe,
	malchusPosition,
	yesodAccepted,
	tiferesContext = {}
) {
	const hodSlope = sampleFinite(tiferesContext.slopeAt, malchusPosition);
	const hodMoisture = sampleFinite(tiferesContext.moistureAt, malchusPosition);
	const hodEnvironment = clamp01(sampleFinite(tiferesContext.environmentScore, malchusPosition, chochmahRecipe) ?? 1);
	const gevurahAccepted = !isExcluded(tiferesContext, malchusPosition, chochmahRecipe)
		&& respectsSpacing(chochmahRecipe.minSpacing, malchusPosition, yesodAccepted)
		&& respectsEcology(chochmahRecipe.ecology, malchusPosition, hodSlope, hodMoisture, hodEnvironment);
	return Object.freeze({
		accepted: gevurahAccepted,
		environmentScore: hodEnvironment,
		slope: hodSlope,
		moisture: hodMoisture
	});
}

/** Returns whether a runtime exclusion function explicitly rejects this position. */
function isExcluded(tiferesContext, malchusPosition, chochmahRecipe) {
	if (typeof tiferesContext.isExcluded !== "function") return false;
	return tiferesContext.isExcluded(malchusPosition, chochmahRecipe) === true;
}

/** Enforces horizontal minimum spacing against placements already accepted into this population. */
function respectsSpacing(gevurahSpacing, malchusPosition, yesodAccepted) {
	if (!(gevurahSpacing > 0)) return true;
	const gevurahDistanceSquared = gevurahSpacing * gevurahSpacing;
	return yesodAccepted.every(yesodPlacement => {
		const netzachDx = yesodPlacement.position.x - malchusPosition.x;
		const netzachDz = yesodPlacement.position.z - malchusPosition.z;
		return netzachDx * netzachDx + netzachDz * netzachDz >= gevurahDistanceSquared;
	});
}

/** Applies optional plant ecology ranges while allowing non-vegetation recipes to pass untouched. */
function respectsEcology(chochmahEcology, malchusPosition, hodSlope, hodMoisture, hodEnvironment) {
	if (!chochmahEcology) return true;
	if (!insideRange(malchusPosition.y, chochmahEcology.height)) return false;
	if (hodSlope !== null && !insideRange(hodSlope, chochmahEcology.slope)) return false;
	if (hodMoisture !== null && !insideRange(hodMoisture, chochmahEcology.moisture)) return false;
	return hodEnvironment >= Number(chochmahEcology.minimumScore || 0);
}

/** Calls one optional sampler and returns only finite numeric evidence. */
function sampleFinite(chochmahSampler, ...tiferesArguments) {
	if (typeof chochmahSampler !== "function") return null;
	const malchusValue = Number(chochmahSampler(...tiferesArguments));
	return Number.isFinite(malchusValue) ? malchusValue : null;
}

/** Tests one value against an inclusive immutable numeric range. */
function insideRange(malchusValue, chochmahRange) {
	if (!chochmahRange) return true;
	return malchusValue >= chochmahRange[0] && malchusValue <= chochmahRange[1];
}

/** Bounds environmental score evidence to the reusable zero-through-one habitat contract. */
function clamp01(chochmahValue) {
	return Math.min(1, Math.max(0, Number.isFinite(Number(chochmahValue)) ? Number(chochmahValue) : 0));
}
