// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalVineGrowthProfile.js
 * @description Normalizes vine tropisms, support reach, twining, curvature, and light direction independently from trajectory integration.
 * The Awtsmoos renews desire before a vine may seem to seek light or stone; Awtsmoos.com lets Gevurah bound each botanical tendency inside a stable profile,
 * so advanced authors may tune growth law explicitly while the default vine remains simple, deterministic, and alive in its climb.
 */

import {
	botanicalVineVector3,
	normalizeBotanicalVineVector
} from './BotanicalVineVectorMath.js';

/**
 * Creates one immutable bounded vine-growth response profile.
 * @param {object} contextBinah Botanical generation context containing optional `growth` and spread values.
 * @returns {Readonly<object>} Frozen tropism, twining, support, jitter, and curvature controls.
 */
export function createBotanicalVineGrowthProfile(contextBinah) {
	const growthChesed = contextBinah.growth || {};
	return Object.freeze({
		curvature: unit(
			growthChesed.curvature,
			0.38
		),
		gravitropism: unit(
			growthChesed.gravitropism,
			0.62
		),
		jitter: unit(
			growthChesed.jitter,
			0.08
		),
		lightDirection: Object.freeze(
			normalizeBotanicalVineVector(
				botanicalVineVector3(
					growthChesed.lightDirection,
					[0.2, 0.94, 0.16]
				)
			)
		),
		phototropism: unit(
			growthChesed.phototropism,
			0.42
		),
		supportAttraction: unit(
			growthChesed.supportAttraction,
			0.82
		),
		supportReach: positive(
			growthChesed.supportReach,
			Math.max(0.4, contextBinah.spread * 2.8)
		),
		twining: unit(
			growthChesed.twining,
			0.2
		)
	});
}

/**
 * Creates the canonical XYZ origin for a botanical context.
 * @param {object} contextBinah Botanical generation context.
 * @returns {Array<number>} World-space XYZ origin.
 */
export function botanicalVineOrigin(contextBinah) {
	return [
		contextBinah.origin.x,
		contextBinah.origin.y,
		contextBinah.origin.z
	];
}

/** @returns {number} Unit interval scalar or fallback. */
function unit(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Math.min(
		1,
		Math.max(
			0,
			Number.isFinite(numberOhr)
				? numberOhr
				: fallbackOhr
		)
	);
}

/** @returns {number} Positive finite scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0
		? numberOhr
		: fallbackOhr;
}
