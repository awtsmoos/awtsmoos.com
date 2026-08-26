// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalFlowerCrownParts.js
 * @description Routes visible flower crowns through shared morphology so archetypes stay recognizable while species-specific whorls, discs, tubes, and symmetry become visible.
 * The Awtsmoos renews the crown before one archetype can imprison living variety; Awtsmoos.com lets rose, daisy, cup, globe, bell, spike, plume, and heart reveal distinct light,
 * so the old stable handler doorway remains while deeper morphology changes the actual geometry a player sees in sight.
 */

import {
	appendBellCrown,
	appendHeartCrown,
	appendPlumeCrown,
	appendSpikeCrown
} from './BotanicalFlowerElongatedCrownParts.js';
import { appendMorphologyPetalWhorls } from './BotanicalFlowerCrownWhorls.js';
import { resolveBotanicalFlowerMorphology } from './BotanicalFlowerMorphology.js';
import {
	botanicalDetailCount,
	botanicalTop
} from './BotanicalFlowerGeometry.js';

/** Appends a composite ray crown whose disc scale follows resolved morphology. */
function appendRay(buffersMalchus, contextBinah) {
	const morphologyBinah = resolveBotanicalFlowerMorphology(
		contextBinah.species
	);
	appendMorphologyPetalWhorls(
		buffersMalchus.bloom,
		contextBinah,
		morphologyBinah,
		{ radius: contextBinah.spread * 0.55 }
	);
	buffersMalchus.accent.addOctahedron(
		botanicalTop(contextBinah),
		contextBinah.spread * Math.max(0.1, morphologyBinah.discRatio * 0.48)
	);
}

/** Appends layered rosette whorls including double roses and peonies. */
function appendRosette(buffersMalchus, contextBinah) {
	const morphologyBinah = resolveBotanicalFlowerMorphology(
		contextBinah.species
	);
	appendMorphologyPetalWhorls(
		buffersMalchus.bloom,
		contextBinah,
		morphologyBinah,
		{ radius: contextBinah.spread * 0.5 }
	);
	buffersMalchus.accent.addOctahedron(
		botanicalTop(contextBinah),
		contextBinah.spread * Math.max(0.07, morphologyBinah.discRatio * 0.35)
	);
}

/** Appends cup/trumpet crowns whose visible rise follows tube-depth evidence. */
function appendCup(buffersMalchus, contextBinah) {
	const morphologyBinah = resolveBotanicalFlowerMorphology(
		contextBinah.species
	);
	appendMorphologyPetalWhorls(
		buffersMalchus.bloom,
		contextBinah,
		morphologyBinah,
		{
			petals: contextBinah.species.petals,
			radius: contextBinah.spread * 0.46
		}
	);
	buffersMalchus.accent.addOctahedron(
		botanicalTop(contextBinah),
		contextBinah.spread * (0.08 + morphologyBinah.tubeDepth * 0.05)
	);
}

/** Appends a phyllotactic globe inflorescence with bounded quality-scaled florets. */
function appendGlobe(buffersMalchus, contextBinah) {
	const countGevurah = botanicalDetailCount(
		contextBinah,
		contextBinah.species.petals,
		6
	);
	const centerMalchus = botanicalTop(contextBinah);
	for (let indexNetzach = 0; indexNetzach < countGevurah; indexNetzach += 1) {
		const angleTiferes = indexNetzach * 2.399;
		buffersMalchus.bloom.addOctahedron([
			centerMalchus[0] + Math.cos(angleTiferes) * contextBinah.spread * 0.24,
			centerMalchus[1] + (indexNetzach % 3 - 1) * contextBinah.spread * 0.12,
			centerMalchus[2] + Math.sin(angleTiferes) * contextBinah.spread * 0.24
		], contextBinah.spread * 0.11);
	}
}

const CROWN_HANDLERS_BINAH = Object.freeze({
	bell: appendBellCrown,
	cup: appendCup,
	globe: appendGlobe,
	heart: appendHeartCrown,
	plume: appendPlumeCrown,
	ray: appendRay,
	rosette: appendRosette,
	spike: appendSpikeCrown
});

/**
 * Appends the selected visible crown while preserving the historic archetype routing contract.
 * @param {object} buffersMalchus Shared botanical material buffers.
 * @param {object} contextBinah Botanical generation context.
 * @returns {void}
 */
export function appendBotanicalFlowerCrown(
	buffersMalchus,
	contextBinah
) {
	const handlerYesod = CROWN_HANDLERS_BINAH[
		contextBinah.species.archetype
	] || appendRay;
	handlerYesod(buffersMalchus, contextBinah);
}
