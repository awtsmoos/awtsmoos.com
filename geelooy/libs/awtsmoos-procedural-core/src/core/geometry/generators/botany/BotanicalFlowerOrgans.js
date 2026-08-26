// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalFlowerOrgans.js
 * @description Plans protective and reproductive flower organs from species morphology instead of one universal radial recipe.
 * The Awtsmoos renews sepal, petal, stamen, and pistil before biology seems divided into parts; Awtsmoos.com lets each species reveal its proper whorl,
 * so composite discs, double roses, bilateral irises, bells, trumpets, and simple meadow flowers share one generator without losing their distinct heart.
 */

import { botanicalDetailCount } from './BotanicalFlowerGeometry.js';
import { resolveBotanicalFlowerMorphology } from './BotanicalFlowerMorphology.js';
import { createBotanicalFlowerOrganLayout } from './BotanicalFlowerOrganLayout.js';

const QUALITY_DETAIL_BINAH = Object.freeze({
	draft: 0.5,
	low: 0.72,
	medium: 1,
	high: 1.35,
	ultra: 1.75,
	cinematic: 2
});

/**
 * Plans explicit morphology-aware protective and reproductive flower organs.
 * @param {object} inputChesed Botanical generation context with species, quality, height, and spread.
 * @returns {Readonly<object>} Frozen organ arrays, morphology evidence, and semantic counts.
 */
export function planBotanicalFlowerOrgans(inputChesed) {
	const contextBinah = realizedContext(inputChesed);
	const morphologyBinah = resolveBotanicalFlowerMorphology(
		contextBinah.species
	);
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
	const spreadTiferes = Math.max(
		1e-9,
		Number(contextBinah.spread) || 1
	);

	return Object.freeze({
		counts: Object.freeze({
			petals: petalsGevurah,
			pistils: 1,
			sepals: sepalsGevurah,
			stamens: stamensGevurah
		}),
		morphology: morphologyBinah,
		petals: organLayout(
			contextBinah,
			morphologyBinah,
			'petal',
			petalsGevurah,
			spreadTiferes * 0.5,
			0,
			spreadTiferes * 0.28
		),
		pistil: Object.freeze([
			createPistil(contextBinah, morphologyBinah, spreadTiferes)
		]),
		sepals: organLayout(
			contextBinah,
			{ ...morphologyBinah, whorls: 1 },
			'sepal',
			sepalsGevurah,
			spreadTiferes * 0.2,
			-spreadTiferes * 0.035,
			spreadTiferes * 0.11
		),
		stamens: organLayout(
			contextBinah,
			stamenMorphology(morphologyBinah),
			'stamen',
			stamensGevurah,
			spreadTiferes * stamenRadius(morphologyBinah),
			spreadTiferes * 0.035,
			spreadTiferes * 0.035
		)
	});
}

/** @returns {Readonly<Array<object>>} Organ records with stable species-role ids. */
function organLayout(contextBinah, morphologyBinah, roleHod, countGevurah, radiusChesed, heightTiferes, scaleChesed) {
	return Object.freeze(createBotanicalFlowerOrganLayout({
		count: countGevurah,
		height: heightTiferes,
		morphology: morphologyBinah,
		radius: radiusChesed,
		role: roleHod,
		scale: scaleChesed
	}).map((organKli) => {
		return Object.freeze({
			...organKli,
			id: organId(contextBinah, roleHod, organKli.index)
		});
	}));
}

/** @returns {Readonly<object>} Central pistil with tube-aware elevation. */
function createPistil(contextBinah, morphologyBinah, spreadTiferes) {
	return Object.freeze({
		angle: 0,
		height: spreadTiferes * (0.055 + morphologyBinah.tubeDepth * 0.16),
		id: organId(contextBinah, 'pistil', 0),
		index: 0,
		radius: 0,
		role: 'pistil',
		scale: spreadTiferes * 0.055,
		whorl: 0,
		x: 0,
		z: 0
	});
}

/** @returns {Readonly<object>} Reproductive layout tuned for composite discs. */
function stamenMorphology(morphologyBinah) {
	return Object.freeze({
		...morphologyBinah,
		whorls: morphologyBinah.form === 'composite'
			? Math.max(2, morphologyBinah.whorls)
			: 1
	});
}

/** @returns {number} Relative reproductive-disc radius. */
function stamenRadius(morphologyBinah) {
	return Math.max(0.08, morphologyBinah.discRatio * 0.5);
}

/** @returns {object} Context with normalized quality detail. */
function realizedContext(contextChesed) {
	if (Number.isFinite(contextChesed.quality?.detail)) {
		return contextChesed;
	}
	const qualityHod = String(contextChesed.quality || 'medium').toLowerCase();
	return {
		...contextChesed,
		quality: {
			detail: QUALITY_DETAIL_BINAH[qualityHod] ?? QUALITY_DETAIL_BINAH.medium
		}
	};
}

/** @returns {string} Stable semantic organ id. */
function organId(contextBinah, roleHod, indexNetzach) {
	return `${contextBinah.species?.id ?? 'custom-botanical'}.flower.${roleHod}.${indexNetzach}`;
}

/** @returns {number} Positive integer or fallback. */
function positiveInteger(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0
		? Math.round(numberOhr)
		: fallbackOhr;
}
