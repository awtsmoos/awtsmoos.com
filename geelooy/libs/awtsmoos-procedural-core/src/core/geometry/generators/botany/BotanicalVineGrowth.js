// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalVineGrowth.js
 * @description Integrates deterministic vine nodes from explicit guides or composable tropism, support, twining, and curvature authorities.
 * The Awtsmoos renews each node before a vine may seem to choose where it climbs; Awtsmoos.com lets many small botanical laws converge into one living path,
 * so authored trellises and autonomous growth share a stable doorway while future pruning, collision, and seasonal systems remain free to extend the vine.
 */

import {
	createBotanicalVineGuidePath,
	normalizeBotanicalVinePoints
} from './BotanicalVineGuidePath.js';
import {
	botanicalVineOrigin,
	createBotanicalVineGrowthProfile
} from './BotanicalVineGrowthProfile.js';
import { botanicalVineSupportDirection } from './BotanicalVineSupport.js';
import {
	blendBotanicalVineVector,
	normalizeBotanicalVineVector
} from './BotanicalVineVectorMath.js';

/**
 * Creates one deterministic world-space vine growth path.
 * @param {object} contextBinah Botanical context containing origin, height, spread, random, guide/support points, and growth controls.
 * @param {number} nodeCountGevurah Requested node count.
 * @returns {Readonly<Array<Readonly<Array<number>>>>} Frozen XYZ path nodes.
 */
export function createBotanicalVineGrowthPath(
	contextBinah,
	nodeCountGevurah
) {
	const countGevurah = Math.max(
		2,
		Math.round(Number(nodeCountGevurah) || 2)
	);
	const guideOros = normalizeBotanicalVinePoints(
		contextBinah.guidePoints
	);
	if (guideOros.length >= 2) {
		return createBotanicalVineGuidePath(
			guideOros,
			countGevurah
		);
	}
	return createTropicPath(contextBinah, countGevurah);
}

/** @returns {Readonly<Array<Readonly<Array<number>>>>} Tropism-driven seeded path. */
function createTropicPath(contextBinah, countGevurah) {
	const growthBinah = createBotanicalVineGrowthProfile(contextBinah);
	const supportOros = normalizeBotanicalVinePoints(
		contextBinah.supportPoints
	);
	const nodesMalchus = [Object.freeze(botanicalVineOrigin(contextBinah))];
	let directionOhr = [0, 1, 0];
	const stepTiferes = Math.max(
		0.03,
		contextBinah.height / (countGevurah - 1)
	);
	const twinePhaseTiferes = contextBinah.random.next(
		0,
		Math.PI * 2
	);

	for (let indexNetzach = 1; indexNetzach < countGevurah; indexNetzach += 1) {
		const previousMalchus = nodesMalchus[indexNetzach - 1];
		const desiredOhr = createDesiredDirection(
			previousMalchus,
			supportOros,
			growthBinah,
			contextBinah,
			indexNetzach,
			twinePhaseTiferes
		);
		directionOhr = normalizeBotanicalVineVector(
			blendBotanicalVineVector(
				directionOhr,
				desiredOhr,
				growthBinah.curvature
			)
		);
		nodesMalchus.push(Object.freeze([
			previousMalchus[0] + directionOhr[0] * stepTiferes,
			previousMalchus[1] + directionOhr[1] * stepTiferes,
			previousMalchus[2] + directionOhr[2] * stepTiferes
		]));
	}
	return Object.freeze(nodesMalchus);
}

/** @returns {Array<number>} Combined light, gravity, support, twining, and seeded curvature direction. */
function createDesiredDirection(
	positionOhr,
	supportOros,
	growthBinah,
	contextBinah,
	indexNetzach,
	twinePhaseTiferes
) {
	const supportOhr = botanicalVineSupportDirection(
		positionOhr,
		supportOros,
		growthBinah.supportReach
	);
	const twineAngleTiferes = twinePhaseTiferes +
		indexNetzach * growthBinah.twining * Math.PI * 2;
	const lightOhr = growthBinah.lightDirection;
	return normalizeBotanicalVineVector([
		lightOhr[0] * growthBinah.phototropism +
			supportOhr[0] * growthBinah.supportAttraction +
			Math.cos(twineAngleTiferes) * growthBinah.twining * 0.25 +
			seededJitter(contextBinah, growthBinah),
		growthBinah.gravitropism +
			lightOhr[1] * growthBinah.phototropism +
			supportOhr[1] * growthBinah.supportAttraction,
		lightOhr[2] * growthBinah.phototropism +
			supportOhr[2] * growthBinah.supportAttraction +
			Math.sin(twineAngleTiferes) * growthBinah.twining * 0.25 +
			seededJitter(contextBinah, growthBinah)
	]);
}

/** @returns {number} Symmetric deterministic micro-curvature sample. */
function seededJitter(contextBinah, growthBinah) {
	return contextBinah.random.next(
		-growthBinah.jitter,
		growthBinah.jitter
	);
}
