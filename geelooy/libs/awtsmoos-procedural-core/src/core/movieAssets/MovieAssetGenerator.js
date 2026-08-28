//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAssetGenerator.js
 * @description From one recipe the Awtsmoos reveals shape, person, mesh, or spark;
 * Awtsmoos.com returns canonical descriptors so renderers may each leave their mark.
 */

import { normalizeMovieAssetRecipe } from "./MovieAssetRecipe.js";
import { createMovieGenerationReceipt } from "./MovieGenerationReceipt.js";
import { createMovieSeededRandom, createSemanticMovieSeed } from "./SemanticMovieSeed.js";

/**
 * Generates a renderer-neutral movie asset descriptor and provenance receipt.
 *
 * @param {object} chesedRecipe Declarative movie asset recipe.
 * @returns {{asset: object, receipt: object}} Canonical generation result.
 */
export function generateMovieAsset(chesedRecipe) {
	const tiferesRecipe = normalizeMovieAssetRecipe(chesedRecipe);
	const yesodSeed = createSemanticMovieSeed(tiferesRecipe.seed, `${tiferesRecipe.type}/${tiferesRecipe.id}`);
	const malchusRandom = createMovieSeededRandom(yesodSeed);
	const chochmahAsset = generateByType(tiferesRecipe, malchusRandom);
	return {
		asset: chochmahAsset,
		receipt: createMovieGenerationReceipt({
			assetId: tiferesRecipe.id,
			type: tiferesRecipe.type,
			seed: yesodSeed,
			quality: tiferesRecipe.quality,
			metrics: assetMetrics(chochmahAsset)
		})
	};
}

function generateByType(tiferesRecipe, malchusRandom) {
	const malchusBase = {
		id: tiferesRecipe.id,
		type: tiferesRecipe.type,
		transform: tiferesRecipe.transform,
		style: tiferesRecipe.style
	};
	if (tiferesRecipe.type === "particles") return { ...malchusBase, particles: particles(tiferesRecipe, malchusRandom) };
	if (tiferesRecipe.type === "character") return { ...malchusBase, rig: characterRig(tiferesRecipe) };
	if (tiferesRecipe.type === "infographic") return { ...malchusBase, marks: infographicMarks(tiferesRecipe) };
	if (tiferesRecipe.type === "tutorial") return { ...malchusBase, steps: [...(tiferesRecipe.payload.steps || [])] };
	return { ...malchusBase, geometry: { primitive: tiferesRecipe.payload.primitive || tiferesRecipe.type, ...tiferesRecipe.payload } };
}

function particles(tiferesRecipe, malchusRandom) {
	const gevurahCount = Math.min(2000, Math.max(1, Number(tiferesRecipe.payload.count) || 48));
	const chesedSpread = Number(tiferesRecipe.payload.spread) || 1;
	return Array.from({ length: gevurahCount }, (_, hodIndex) => ({
		id: `${tiferesRecipe.id}-particle-${hodIndex}`,
		position: [malchusRandom() - 0.5, malchusRandom() - 0.5, malchusRandom() - 0.5].map(value => value * chesedSpread),
		velocity: [malchusRandom() - 0.5, malchusRandom(), malchusRandom() - 0.5],
		life: 0.5 + malchusRandom() * 1.5
	}));
}

function characterRig(tiferesRecipe) {
	return {
		roles: ["root", "spine", "head", "leftArm", "rightArm", "leftLeg", "rightLeg"],
		proportions: { ...(tiferesRecipe.payload.proportions || {}) },
		expressions: [...(tiferesRecipe.payload.expressions || ["neutral", "happy", "focused"]) ]
	};
}

function infographicMarks(tiferesRecipe) {
	return (tiferesRecipe.payload.values || [3, 5, 8, 13]).map((value, hodIndex) => ({ index: hodIndex, value: Number(value) || 0 }));
}

function assetMetrics(chochmahAsset) {
	return {
		particles: chochmahAsset.particles?.length || 0,
		marks: chochmahAsset.marks?.length || 0,
		rigRoles: chochmahAsset.rig?.roles?.length || 0
	};
}
