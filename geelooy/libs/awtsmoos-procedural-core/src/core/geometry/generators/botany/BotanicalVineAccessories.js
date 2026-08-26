// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalVineAccessories.js
 * @description Appends vine leaves, tendrils, and bloom sites independently from growth-path integration and stem topology.
 * The Awtsmoos renews leaf, tendril, and blossom before the climbing stem can claim to contain their purpose; Awtsmoos.com lets each accessory emerge from one living node,
 * so growth-path realism may evolve freely while foliage, grasping organs, and flowers remain focused botanical vessels instead of crowding the vine coordinator.
 */

import { appendStemRibbon } from './BotanicalGroundGeometry.js';

/**
 * Appends one alternating vine leaf around a resolved growth node.
 * @param {object} buffersMalchus Botanical material buffers.
 * @param {object} contextBinah Botanical generation context.
 * @param {Array<number>} pointMalchus World-space growth node.
 * @param {number} indexNetzach Stable node index.
 * @returns {void}
 */
export function appendBotanicalVineLeaf(
	buffersMalchus,
	contextBinah,
	pointMalchus,
	indexNetzach
) {
	const sideGevurah = indexNetzach % 2 === 0 ? 1 : -1;
	const angleTiferes = indexNetzach * 2.399 + sideGevurah * 0.4;
	const distanceChesed = contextBinah.spread *
		contextBinah.random.next(0.12, 0.22);
	const centerMalchus = [
		pointMalchus[0] + Math.cos(angleTiferes) * distanceChesed,
		pointMalchus[1] + contextBinah.height *
			contextBinah.random.next(-0.015, 0.035),
		pointMalchus[2] + Math.sin(angleTiferes) * distanceChesed
	];
	buffersMalchus.green.addDiamond(
		centerMalchus,
		contextBinah.spread * contextBinah.random.next(0.08, 0.14),
		contextBinah.height * contextBinah.random.next(0.035, 0.07),
		angleTiferes
	);
}

/**
 * Appends one slender grasping tendril from a resolved growth node.
 * @param {object} buffersMalchus Botanical material buffers.
 * @param {object} contextBinah Botanical generation context.
 * @param {Array<number>} pointMalchus World-space growth node.
 * @param {number} indexNetzach Stable node index.
 * @returns {void}
 */
export function appendBotanicalVineTendril(
	buffersMalchus,
	contextBinah,
	pointMalchus,
	indexNetzach
) {
	const angleTiferes = indexNetzach * 1.618 +
		contextBinah.random.next(-0.4, 0.4);
	const reachChesed = contextBinah.spread *
		contextBinah.random.next(0.12, 0.24);
	const tipMalchus = [
		pointMalchus[0] + Math.cos(angleTiferes) * reachChesed,
		pointMalchus[1] + contextBinah.height *
			contextBinah.random.next(0.01, 0.06),
		pointMalchus[2] + Math.sin(angleTiferes) * reachChesed
	];
	appendStemRibbon(
		buffersMalchus.accent,
		pointMalchus,
		tipMalchus,
		contextBinah.spread * 0.005
	);
}

/**
 * Appends one compact bloom site along a mature vine node.
 * @param {object} buffersMalchus Botanical material buffers.
 * @param {object} contextBinah Botanical generation context.
 * @param {Array<number>} pointMalchus World-space growth node.
 * @param {number} indexNetzach Stable node index.
 * @returns {void}
 */
export function appendBotanicalVineBloom(
	buffersMalchus,
	contextBinah,
	pointMalchus,
	indexNetzach
) {
	const angleTiferes = indexNetzach * 1.3;
	const offsetChesed = contextBinah.spread * 0.08;
	const centerMalchus = [
		pointMalchus[0] + Math.cos(angleTiferes) * offsetChesed,
		pointMalchus[1] + contextBinah.height * 0.035,
		pointMalchus[2] + Math.sin(angleTiferes) * offsetChesed
	];
	buffersMalchus.bloom.addOctahedron(
		centerMalchus,
		contextBinah.spread * contextBinah.random.next(0.025, 0.045)
	);
}
