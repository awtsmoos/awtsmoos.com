// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalFlowerCrownWhorls.js
 * @description Builds morphology-aware visible petal whorls with bilateral shaping, layered radius, tube rise, and petal curvature.
 * The Awtsmoos renews each petal before radius or symmetry may seem to contain its beauty; Awtsmoos.com lets layered crowns descend through measured whorls,
 * so rose, iris, daffodil, bell, and meadow ray may share one geometric covenant while revealing visibly different botanical stories.
 */

import {
	botanicalDetailCount,
	botanicalTop
} from './BotanicalFlowerGeometry.js';

/**
 * Appends one or more visible petal whorls using resolved flower morphology.
 * @param {object} buffer Botanical bloom geometry buffer.
 * @param {object} contextBinah Botanical generation context.
 * @param {Readonly<object>} morphologyBinah Resolved flower morphology.
 * @param {object} [optionsChesed={}] Optional radius, petal count, and phase controls.
 * @returns {void}
 */
export function appendMorphologyPetalWhorls(
	buffer,
	contextBinah,
	morphologyBinah,
	optionsChesed = {}
) {
	const baseCountGevurah = botanicalDetailCount(
		contextBinah,
		optionsChesed.petals ?? contextBinah.species.petals,
		3
	);
	const whorlsGevurah = Math.max(
		1,
		Math.round(Number(morphologyBinah.whorls) || 1)
	);
	const baseRadiusChesed = Number(optionsChesed.radius) ||
		contextBinah.spread * 0.5;
	const basePhaseTiferes = Number(optionsChesed.phase) || 0;

	for (let whorlNetzach = 0; whorlNetzach < whorlsGevurah; whorlNetzach += 1) {
		appendWhorl(
			buffer,
			contextBinah,
			morphologyBinah,
			baseCountGevurah,
			baseRadiusChesed,
			basePhaseTiferes,
			whorlNetzach,
			whorlsGevurah
		);
	}
}

/** Appends one concentric morphology-aware petal whorl. */
function appendWhorl(
	buffer,
	contextBinah,
	morphologyBinah,
	baseCountGevurah,
	baseRadiusChesed,
	basePhaseTiferes,
	whorlNetzach,
	whorlsGevurah
) {
	const fractionTiferes = whorlsGevurah <= 1
		? 0
		: whorlNetzach / (whorlsGevurah - 1);
	const countGevurah = Math.max(
		3,
		Math.round(baseCountGevurah * (1 - fractionTiferes * 0.26))
	);
	const radiusChesed = baseRadiusChesed *
		(1 - fractionTiferes * 0.42);
	const phaseTiferes = basePhaseTiferes +
		whorlNetzach * Math.PI / countGevurah;
	const liftChesed = contextBinah.spread * (
		morphologyBinah.tubeDepth * 0.22 +
		morphologyBinah.petalCurve * fractionTiferes * 0.16
	);

	for (let petalNetzach = 0; petalNetzach < countGevurah; petalNetzach += 1) {
		appendPetal(
			buffer,
			contextBinah,
			morphologyBinah,
			petalNetzach,
			countGevurah,
			radiusChesed,
			phaseTiferes,
			liftChesed
		);
	}
}

/** Appends one petal quad with morphology-aware lateral shaping. */
function appendPetal(
	buffer,
	contextBinah,
	morphologyBinah,
	petalNetzach,
	countGevurah,
	radiusChesed,
	phaseTiferes,
	liftChesed
) {
	const centerMalchus = botanicalTop(contextBinah);
	const angleTiferes = petalNetzach / countGevurah *
		Math.PI * 2 + phaseTiferes;
	const radialOhr = shapedDirection(
		angleTiferes,
		morphologyBinah.symmetry
	);
	const tangentOhr = [-radialOhr[1], radialOhr[0]];
	const widthGevurah = radiusChesed *
		(0.28 + morphologyBinah.petalCurve * 0.12);
	buffer.addQuad([
		centerMalchus,
		petalPoint(centerMalchus, radialOhr, tangentOhr, radiusChesed * 0.48, widthGevurah, liftChesed * 0.45),
		petalPoint(centerMalchus, radialOhr, tangentOhr, radiusChesed, 0, liftChesed),
		petalPoint(centerMalchus, radialOhr, tangentOhr, radiusChesed * 0.48, -widthGevurah, liftChesed * 0.45)
	]);
}

/** @returns {Array<number>} Symmetry-shaped X/Z direction. */
function shapedDirection(angleTiferes, symmetryHod) {
	const xOhr = Math.cos(angleTiferes);
	const zOhr = Math.sin(angleTiferes);
	return String(symmetryHod) === 'bilateral'
		? [xOhr * 0.62, zOhr]
		: [xOhr, zOhr];
}

/** @returns {Array<number>} One world-space petal control point. */
function petalPoint(centerMalchus, radialOhr, tangentOhr, radiusChesed, tangentGevurah, liftChesed) {
	return [
		centerMalchus[0] + radialOhr[0] * radiusChesed + tangentOhr[0] * tangentGevurah,
		centerMalchus[1] + liftChesed,
		centerMalchus[2] + radialOhr[1] * radiusChesed + tangentOhr[1] * tangentGevurah
	];
}
