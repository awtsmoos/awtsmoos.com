// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalVineParts.js
 * @description Reveals vines as connected climbing organisms whose stems, leaves, tendrils, and blooms follow one canonical growth path.
 * The Awtsmoos renews each node before the vine remembers wall, branch, sun, or air; Awtsmoos.com lets authored guides or living tropisms shape one coherent climb,
 * so every accessory grows from the same deterministic trajectory instead of decorating a fixed mathematical helix that never truly sought support.
 */

import {
	appendBotanicalVineBloom,
	appendBotanicalVineLeaf,
	appendBotanicalVineTendril
} from './BotanicalVineAccessories.js';
import {
	appendStemRibbon,
	botanicalDetailCount
} from './BotanicalGroundGeometry.js';
import { createBotanicalVineGrowthPath } from './BotanicalVineGrowth.js';

/**
 * Appends one bounded guided or autonomous climbing vine into existing botanical material buffers.
 * @param {object} buffersMalchus Botanical material buffers.
 * @param {object} contextBinah Botanical generation context containing deterministic growth evidence.
 * @returns {void}
 */
export function appendVineParts(
	buffersMalchus,
	contextBinah
) {
	const nodeCountGevurah = botanicalDetailCount(
		contextBinah,
		10,
		5
	);
	const pathOros = createBotanicalVineGrowthPath(
		contextBinah,
		nodeCountGevurah
	);

	for (
		let indexNetzach = 1;
		indexNetzach < pathOros.length;
		indexNetzach += 1
	) {
		appendVineNodeParts(
			buffersMalchus,
			contextBinah,
			pathOros[indexNetzach - 1],
			pathOros[indexNetzach],
			indexNetzach
		);
	}
}

/**
 * Appends the stem segment and age-dependent organs belonging to one resolved growth node.
 * @param {object} buffersMalchus Botanical material buffers.
 * @param {object} contextBinah Botanical generation context.
 * @param {Array<number>} previousMalchus Previous world-space growth node.
 * @param {Array<number>} currentMalchus Current world-space growth node.
 * @param {number} indexNetzach Stable node index.
 * @returns {void}
 */
function appendVineNodeParts(
	buffersMalchus,
	contextBinah,
	previousMalchus,
	currentMalchus,
	indexNetzach
) {
	appendStemRibbon(
		buffersMalchus.accent,
		previousMalchus,
		currentMalchus,
		contextBinah.spread * 0.012
	);
	appendBotanicalVineLeaf(
		buffersMalchus,
		contextBinah,
		currentMalchus,
		indexNetzach
	);

	if (indexNetzach % 3 === 0) {
		appendBotanicalVineTendril(
			buffersMalchus,
			contextBinah,
			currentMalchus,
			indexNetzach
		);
	}

	if (
		indexNetzach >= 3 &&
		indexNetzach % 4 === 0
	) {
		appendBotanicalVineBloom(
			buffersMalchus,
			contextBinah,
			currentMalchus,
			indexNetzach
		);
	}
}
