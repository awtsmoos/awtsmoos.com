// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalVineGuidePath.js
 * @description Normalizes and evenly samples explicit guide/support points without mixing authored-path handling into autonomous tropism integration.
 * The Awtsmoos renews every intended waypoint before a vine can appear to obey a designer's hand; Awtsmoos.com lets Malchus receive authored structure cleanly,
 * so procedural growth may yield to explicit paths when desired while the same renderer-neutral coordinates remain shared by every botanical vessel.
 */

import {
	blendBotanicalVineVector,
	botanicalVineVector3
} from './BotanicalVineVectorMath.js';

/**
 * Normalizes arbitrary point arrays/objects into finite XYZ coordinates.
 * @param {Array<object|Array<number>>} [pointsOros=[]] Candidate guide or support points.
 * @returns {Readonly<Array<Readonly<Array<number>>>>} Frozen normalized point collection.
 */
export function normalizeBotanicalVinePoints(pointsOros = []) {
	if (!Array.isArray(pointsOros)) {
		return Object.freeze([]);
	}
	return Object.freeze(pointsOros.map((pointOhr) => {
		return Object.freeze(
			botanicalVineVector3(pointOhr, [0, 0, 0])
		);
	}));
}

/**
 * Evenly samples a polyline guide into a fixed count while preserving exact first and last guide coordinates.
 * @param {Readonly<Array<Readonly<Array<number>>>>} guideOros Normalized guide points.
 * @param {number} nodeCountGevurah Desired sampled node count.
 * @returns {Readonly<Array<Readonly<Array<number>>>>} Frozen sampled path.
 */
export function createBotanicalVineGuidePath(
	guideOros,
	nodeCountGevurah
) {
	const countGevurah = Math.max(
		2,
		Math.round(Number(nodeCountGevurah) || 2)
	);
	if (!guideOros || guideOros.length < 2) {
		return Object.freeze([]);
	}

	const nodesMalchus = [];
	for (let indexNetzach = 0; indexNetzach < countGevurah; indexNetzach += 1) {
		const progressTiferes = indexNetzach / (countGevurah - 1);
		const scaledTiferes = progressTiferes * (guideOros.length - 1);
		const segmentNetzach = Math.min(
			guideOros.length - 2,
			Math.floor(scaledTiferes)
		);
		const localTiferes = scaledTiferes - segmentNetzach;
		nodesMalchus.push(Object.freeze(
			blendBotanicalVineVector(
				guideOros[segmentNetzach],
				guideOros[segmentNetzach + 1],
				localTiferes
			)
		));
	}
	return Object.freeze(nodesMalchus);
}
