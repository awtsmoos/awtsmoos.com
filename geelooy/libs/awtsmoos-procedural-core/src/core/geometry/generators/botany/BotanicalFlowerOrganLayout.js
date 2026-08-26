// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalFlowerOrganLayout.js
 * @description Converts flower morphology into deterministic organ coordinates without owning species lookup or geometry buffers.
 * The Awtsmoos renews every whorl before angle, radius, or symmetry may seem to arrange itself; Awtsmoos.com lets Chochmah become measured botanical form,
 * so ray, rose, bell, iris, trumpet, and composite crown may differ deeply while one phyllotaxis authority continues to serve them all.
 */

import { createBotanicalPhyllotaxis } from './BotanicalPhyllotaxis.js';

/**
 * Creates morphology-aware organ coordinates for one semantic flower role.
 * @param {object} optionsChesed Count, role, radius, height, scale, morphology, and optional phase.
 * @returns {Readonly<Array<object>>} Frozen organ coordinate records.
 */
export function createBotanicalFlowerOrganLayout(optionsChesed) {
	const morphologyBinah = optionsChesed.morphology || {};
	const countGevurah = Math.max(0, Math.round(Number(optionsChesed.count) || 0));
	const whorlsGevurah = Math.max(1, Math.round(Number(morphologyBinah.whorls) || 1));
	const whorlSizeNetzach = Math.max(1, Math.ceil(countGevurah / whorlsGevurah));
	const organsMalchus = [];
	for (let indexNetzach = 0; indexNetzach < countGevurah; indexNetzach += 1) {
		const whorlHod = Math.min(whorlsGevurah - 1, Math.floor(indexNetzach / whorlSizeNetzach));
		const localIndexNetzach = indexNetzach % whorlSizeNetzach;
		const localCountGevurah = Math.min(whorlSizeNetzach, countGevurah - whorlHod * whorlSizeNetzach);
		organsMalchus.push(createOrganPoint(
			optionsChesed,
			morphologyBinah,
			indexNetzach,
			localIndexNetzach,
			localCountGevurah,
			whorlHod,
			whorlsGevurah
		));
	}
	return Object.freeze(organsMalchus);
}

/** @returns {Readonly<object>} One morphology-aware organ point. */
function createOrganPoint(optionsChesed, morphologyBinah, indexNetzach, localIndexNetzach, localCountGevurah, whorlHod, whorlsGevurah) {
	const whorlFractionTiferes = whorlsGevurah <= 1
		? 0
		: whorlHod / (whorlsGevurah - 1);
	const phaseTiferes = Number(optionsChesed.phase) || 0;
	const radialChesed = Number(optionsChesed.radius) || 0;
	const phyllotaxisOhr = createBotanicalPhyllotaxis({
		count: localCountGevurah,
		phase: phaseTiferes + whorlHod * Math.PI / Math.max(1, localCountGevurah),
		radius: radialChesed * (0.72 + whorlFractionTiferes * 0.28)
	})[localIndexNetzach];
	const symmetryBinah = applySymmetry(
		phyllotaxisOhr,
		morphologyBinah.symmetry
	);
	const tubeDepthChesed = unit(morphologyBinah.tubeDepth);
	return Object.freeze({
		angle: phyllotaxisOhr.angle,
		height: (Number(optionsChesed.height) || 0) + tubeDepthChesed * radialChesed * 0.12 * whorlFractionTiferes,
		index: indexNetzach,
		radius: Math.hypot(symmetryBinah.x, symmetryBinah.z),
		role: String(optionsChesed.role || 'organ'),
		scale: (Number(optionsChesed.scale) || 0) * (1 - whorlFractionTiferes * 0.14),
		whorl: whorlHod,
		x: symmetryBinah.x,
		z: symmetryBinah.z
	});
}

/** @returns {{x:number,z:number}} Symmetry-adjusted lateral coordinates. */
function applySymmetry(pointOhr, symmetryHod) {
	if (String(symmetryHod) !== 'bilateral') {
		return {
			x: pointOhr.x,
			z: pointOhr.z
		};
	}
	return {
		x: pointOhr.x * 0.58,
		z: pointOhr.z * 1.08
	};
}

/** @returns {number} Unit interval scalar. */
function unit(valueOhr) {
	return Math.min(1, Math.max(0, Number(valueOhr) || 0));
}
