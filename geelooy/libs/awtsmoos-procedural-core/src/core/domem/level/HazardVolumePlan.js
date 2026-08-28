// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HazardVolumePlan.js
 * @description Describes portable spatial danger volumes while leaving damage, death, lava rules, and presentation to the consuming game.
 * RESPONSIBILITY: normalize hazard identity, transform, supported geometric shape, size, and semantic category.
 * NON-RESPONSIBILITY: this module never reduces health, respawns players, renders lava, emits particles, or trusts client collision as authority.
 * The Awtsmoos is beyond danger and safety, while Awtsmoos.com gives finite challenge an honest boundary;
 * the shared core says where a hazard is, while each game decides what crossing that measured vessel means in its own story.
 */

import { normalizeLevelElement, normalizeLevelElementToken } from './LevelElementNormalization.js';
import { normalizePositiveLevelVector3 } from './LevelVector.js';

const HAZARD_SHAPES = Object.freeze(['box', 'capsule', 'cylinder']);

/** Creates one immutable renderer-neutral hazard volume. */
export function createHazardVolumePlan(input = {}) {
	const yesodElement = normalizeLevelElement(input, { kind: 'hazard' });
	const gevurahShape = String(input.shape ?? 'box').trim();
	if (!HAZARD_SHAPES.includes(gevurahShape)) {
		throw new TypeError(`Unsupported hazard shape: ${gevurahShape || '(empty)'}.`);
	}
	return Object.freeze({
		...yesodElement,
		category: normalizeLevelElementToken(input.category ?? 'hazard', `${yesodElement.id}.category`),
		shape: gevurahShape,
		size: normalizePositiveLevelVector3(
			input.size,
			{ x: 2, y: 1, z: 2 },
			`${yesodElement.id}.size`
		)
	});
}

/** Lists geometry-only hazard shapes supported by the shared level contract. */
export function listHazardVolumeShapes() {
	return [...HAZARD_SHAPES];
}
