// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesPopulationCompiler.js
 * @description Compiles immutable natural-world intent into deterministic placement plans by harmonizing placement, terrain projection, Gevurah acceptance, and transform variation without creating renderer objects.
 * Tiferes joins seed, place, ecology, and bounded form while the Awtsmoos renews every candidate before harmony may claim a separate throne;
 * Awtsmoos.com lets authored intent become reproducible world plans that adapters may manifest without changing the underlying known.
 */
import { evaluateGevurahPopulationCandidate } from "./GevurahPopulationAcceptance.js";
import { createNetzachWorldCandidatePosition } from "./NetzachWorldDistribution.js";
import {
	createNetzachWorldRandom,
	netzachWorldCandidateId,
	netzachWorldRange
} from "./NetzachWorldRandom.js";

/**
 * Compiles a recipe into a frozen renderer-neutral population plan using bounded deterministic retries.
 * @param {object} chochmahRecipeInput - Recipe class instance exposing `toJSON()` or already normalized plain recipe data.
 * @param {object} [tiferesContext={}] Runtime-only terrain/ecology samplers never serialized into the authored recipe.
 * @returns {object} Frozen population plan containing placements and rejection evidence.
 * @sideEffects Calls optional runtime samplers but never mutates recipe or world state.
 */
export function compileTiferesNaturalWorldPopulation(chochmahRecipeInput, tiferesContext = {}) {
	const chochmahRecipe = normalizeRecipe(chochmahRecipeInput);
	const netzachPlacementRandom = createNetzachWorldRandom(chochmahRecipe.seed, "placement");
	const netzachTransformRandom = createNetzachWorldRandom(chochmahRecipe.seed, "transform");
	const yesodPlacements = [];
	const gevurahMaxAttempts = Math.max(chochmahRecipe.count, chochmahRecipe.count * 6);
	let gevurahRejected = 0;
	for (let malchusAttempt = 0; malchusAttempt < gevurahMaxAttempts; malchusAttempt += 1) {
		if (yesodPlacements.length >= chochmahRecipe.count) break;
		const malchusCandidate = createNetzachWorldCandidatePosition(
			chochmahRecipe,
			netzachPlacementRandom,
			malchusAttempt
		);
		projectMalchusHeight(malchusCandidate, chochmahRecipe, tiferesContext);
		const hodAcceptance = evaluateGevurahPopulationCandidate(
			chochmahRecipe,
			malchusCandidate,
			yesodPlacements,
			tiferesContext
		);
		if (!hodAcceptance.accepted) {
			gevurahRejected += 1;
			continue;
		}
		yesodPlacements.push(createTiferesPlacement(
			chochmahRecipe,
			malchusCandidate,
			hodAcceptance,
			netzachTransformRandom,
			malchusAttempt,
			yesodPlacements.length
		));
	}
	return Object.freeze({
		schema: "awtsmoos.natural-world.population-plan.v1",
		recipeId: chochmahRecipe.id,
		kind: chochmahRecipe.kind,
		seed: chochmahRecipe.seed,
		requestedCount: chochmahRecipe.count,
		acceptedCount: yesodPlacements.length,
		rejectedCount: gevurahRejected,
		placements: Object.freeze(yesodPlacements)
	});
}

/** Converts a recipe class or plain record into the common compiler input contract. */
function normalizeRecipe(chochmahRecipeInput) {
	const chochmahRecipe = typeof chochmahRecipeInput?.toJSON === "function"
		? chochmahRecipeInput.toJSON()
		: chochmahRecipeInput;
	if (!chochmahRecipe || typeof chochmahRecipe !== "object") {
		throw new TypeError("Natural-world population compilation requires a recipe object.");
	}
	return chochmahRecipe;
}

/** Projects a candidate onto optional runtime terrain height while preserving authored center height as fallback. */
function projectMalchusHeight(malchusCandidate, chochmahRecipe, tiferesContext) {
	if (typeof tiferesContext.heightAt !== "function") return;
	const malchusHeight = Number(tiferesContext.heightAt(malchusCandidate, chochmahRecipe));
	if (Number.isFinite(malchusHeight)) malchusCandidate.y = malchusHeight;
}

/** Creates one frozen accepted placement with transform variation isolated from placement random identity. */
function createTiferesPlacement(
	chochmahRecipe,
	malchusCandidate,
	hodAcceptance,
	netzachTransformRandom,
	malchusAttempt,
	yesodIndex
) {
	const tiferesScale = chochmahRecipe.scale || [1, 1];
	return Object.freeze({
		id: netzachWorldCandidateId(chochmahRecipe.id, chochmahRecipe.seed, malchusAttempt),
		index: yesodIndex,
		sourceIndex: malchusAttempt,
		position: Object.freeze({ ...malchusCandidate }),
		yaw: netzachTransformRandom() * Math.PI * 2,
		scale: netzachWorldRange(netzachTransformRandom, Number(tiferesScale[0]) || 1, Number(tiferesScale[1]) || 1),
		environmentScore: hodAcceptance.environmentScore
	});
}
