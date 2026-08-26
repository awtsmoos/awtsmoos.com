// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalFlowerOrganCounts.js
 * @description Resolves quality-aware flower organ counts independently from spatial layout and geometry emission.
 * The Awtsmoos renews number before a count can limit living form; Awtsmoos.com lets Gevurah bound petals and stamens while Chesed preserves species abundance,
 * so quality tiers remain finite and professional without confusing biological count policy with the coordinates where organs are revealed.
 */

import { botanicalDetailCount } from './BotanicalFlowerGeometry.js';

const QUALITY_DETAIL_BINAH = Object.freeze({
	draft: 0.5,
	low: 0.72,
	medium: 1,
	high: 1.35,
	ultra: 1.75,
	cinematic: 2
});

/**
 * Normalizes a botanical context so quality always exposes a numeric detail multiplier.
 * @param {object} contextChesed Botanical generation context.
 * @returns {object} Original or copied context with normalized quality detail.
 */
export function createFlowerOrganContext(contextChesed) {
	if (Number.isFinite(contextChesed.quality?.detail)) {
		return contextChesed;
	}
	const qualityHod = String(
		contextChesed.quality || 'medium'
	).toLowerCase();
	return {
		...contextChesed,
		quality: {
			detail: QUALITY_DETAIL_BINAH[qualityHod] ??
				QUALITY_DETAIL_BINAH.medium
		}
	};
}

/**
 * Derives quality-bounded organ counts from species petal declaration and resolved morphology.
 * @param {object} contextBinah Normalized botanical context.
 * @param {Readonly<object>} morphologyBinah Flower morphology record.
 * @returns {Readonly<object>} Frozen base-petal, petal, sepal, stamen, and pistil counts.
 */
export function createFlowerOrganCounts(
	contextBinah,
	morphologyBinah
) {
	const basePetalsGevurah = positiveInteger(
		contextBinah.species?.petals,
		6
	);
	const petalsGevurah = botanicalDetailCount(
		contextBinah,
		basePetalsGevurah * morphologyBinah.whorls,
		3
	);
	const sepalsGevurah = Math.max(
		3,
		Math.round(basePetalsGevurah * 0.55)
	);
	const stamensGevurah = botanicalDetailCount(
		contextBinah,
		basePetalsGevurah * morphologyBinah.stamenRatio,
		4
	);
	return Object.freeze({
		basePetals: basePetalsGevurah,
		petals: petalsGevurah,
		pistils: 1,
		sepals: sepalsGevurah,
		stamens: stamensGevurah
	});
}

/** @returns {number} Positive integer or fallback. */
function positiveInteger(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0
		? Math.round(numberOhr)
		: fallbackOhr;
}
