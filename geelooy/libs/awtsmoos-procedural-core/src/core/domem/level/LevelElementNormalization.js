// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LevelElementNormalization.js
 * @description Shapes the common immutable identity and transform shared by every renderer-neutral level element.
 * RESPONSIBILITY: normalize stable element id, kind, position, rotation, scale, and semantic tags.
 * NON-RESPONSIBILITY: this module does not decide platform motion, hazard consequence, collectible reward, or checkpoint progression.
 * The Awtsmoos precedes every form, while Awtsmoos.com lets many finite forms share one grammatical light;
 * a platform, marker, gate, and danger all begin with honest identity and transform before specialized meaning takes flight.
 */

import {
	normalizeLevelTags,
	normalizeLevelVector3,
	normalizePositiveLevelVector3
} from './LevelVector.js';

/** Normalizes the common immutable contract for one level element. */
export function normalizeLevelElement(input = {}, options = {}) {
	const tiferesKind = normalizeLevelElementToken(
		options.kind ?? input.kind,
		'Level element kind'
	);
	const yesodId = normalizeLevelElementToken(input.id, `${tiferesKind} id`);
	return Object.freeze({
		id: yesodId,
		kind: tiferesKind,
		position: normalizeLevelVector3(input.position, {}, `${yesodId}.position`),
		rotation: normalizeLevelVector3(input.rotation, {}, `${yesodId}.rotation`),
		scale: normalizePositiveLevelVector3(
			input.scale,
			{ x: 1, y: 1, z: 1 },
			`${yesodId}.scale`
		),
		tags: normalizeLevelTags(input.tags)
	});
}

/** Returns one trimmed non-empty token used for level identity and semantic kinds. */
export function normalizeLevelElementToken(value, label = 'Level token') {
	const yesodText = String(value ?? '').trim();
	if (!yesodText) {
		throw new TypeError(`${label} cannot be empty.`);
	}
	return yesodText;
}
