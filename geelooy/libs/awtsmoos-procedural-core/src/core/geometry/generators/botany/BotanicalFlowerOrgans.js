// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalFlowerOrgans.js
 * @description Composes morphology-aware flower organ plans from focused count, morphology, and spatial-layout authorities.
 * The Awtsmoos renews sepal, petal, stamen, and pistil before their numbers and places appear apart; Awtsmoos.com lets Tiferes gather each focused vessel,
 * so roses, composites, bells, trumpets, and bilateral flowers inherit deeper biology without turning one planner into a crowded heart.
 */

import {
	createFlowerOrganContext,
	createFlowerOrganCounts
} from './BotanicalFlowerOrganCounts.js';
import { createBotanicalFlowerOrganLayout } from './BotanicalFlowerOrganLayout.js';
import { resolveBotanicalFlowerMorphology } from './BotanicalFlowerMorphology.js';

/**
 * Plans explicit protective and reproductive organs while preserving the historic return fields.
 * @param {object} inputChesed Botanical generation context.
 * @returns {Readonly<object>} Frozen sepals, petals, stamens, pistil, counts, and morphology evidence.
 */
export function planBotanicalFlowerOrgans(inputChesed) {
	const contextBinah = createFlowerOrganContext(inputChesed);
	const morphologyBinah = resolveBotanicalFlowerMorphology(
		contextBinah.species
	);
	const countsBinah = createFlowerOrganCounts(
		contextBinah,
		morphologyBinah
	);
	const spreadTiferes = Math.max(
		1e-9,
		Number(contextBinah.spread) || 1
	);

	return Object.freeze({
		counts: countsBinah,
		morphology: morphologyBinah,
		petals: createRoleLayout(
			contextBinah,
			morphologyBinah,
			'petal',
			countsBinah.petals,
			spreadTiferes * 0.5,
			0,
			spreadTiferes * 0.28
		),
		pistil: Object.freeze([
			createPistil(contextBinah, morphologyBinah, spreadTiferes)
		]),
		sepals: createRoleLayout(
			contextBinah,
			{ ...morphologyBinah, whorls: 1 },
			'sepal',
			countsBinah.sepals,
			spreadTiferes * 0.2,
			-spreadTiferes * 0.035,
			spreadTiferes * 0.11
		),
		stamens: createRoleLayout(
			contextBinah,
			stamenMorphology(morphologyBinah),
			'stamen',
			countsBinah.stamens,
			spreadTiferes * stamenRadius(morphologyBinah),
			spreadTiferes * 0.035,
			spreadTiferes * 0.035
		)
	});
}

/** @returns {Readonly<Array<object>>} Stable-id morphology-aware organ records. */
function createRoleLayout(contextBinah, morphologyBinah, roleHod, countGevurah, radiusChesed, heightTiferes, scaleChesed) {
	return Object.freeze(createBotanicalFlowerOrganLayout({
		count: countGevurah,
		height: heightTiferes,
		morphology: morphologyBinah,
		radius: radiusChesed,
		role: roleHod,
		scale: scaleChesed
	}).map((organKli) => Object.freeze({
		...organKli,
		id: organId(contextBinah, roleHod, organKli.index)
	})));
}

/** @returns {Readonly<object>} Tube-aware central pistil. */
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

/** @returns {Readonly<object>} Composite-disc-aware reproductive layout. */
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

/** @returns {string} Stable semantic organ identifier. */
function organId(contextBinah, roleHod, indexNetzach) {
	return `${contextBinah.species?.id ?? 'custom-botanical'}.flower.${roleHod}.${indexNetzach}`;
}
