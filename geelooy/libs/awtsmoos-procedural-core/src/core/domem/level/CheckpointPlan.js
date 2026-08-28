// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CheckpointPlan.js
 * @description Defines ordered spatial checkpoints and safe respawn poses without owning player progression or multiplayer claims.
 * RESPONSIBILITY: normalize checkpoint sequence, trigger position, respawn transform, and safe radius.
 * NON-RESPONSIBILITY: this module does not mark checkpoints reached, persist profiles, teleport players, or authorize course progression.
 * The Awtsmoos renews beginning and return in one present; Awtsmoos.com gives finite journeys remembered stations along the way;
 * a checkpoint may name where recovery begins, while game authority alone decides whether a traveler has earned that stay.
 */

import { normalizeLevelElement } from './LevelElementNormalization.js';
import { levelIndex, positiveLevelNumber } from './LevelNumbers.js';
import { normalizeLevelVector3 } from './LevelVector.js';

/** Creates one immutable checkpoint definition. */
export function createCheckpointPlan(input = {}) {
	const yesodElement = normalizeLevelElement(input, { kind: 'checkpoint' });
	return Object.freeze({
		...yesodElement,
		respawnPosition: normalizeLevelVector3(
			input.respawnPosition ?? yesodElement.position,
			yesodElement.position,
			`${yesodElement.id}.respawnPosition`
		),
		respawnRotation: normalizeLevelVector3(
			input.respawnRotation ?? yesodElement.rotation,
			yesodElement.rotation,
			`${yesodElement.id}.respawnRotation`
		),
		safeRadius: positiveLevelNumber(input.safeRadius ?? 1.5, `${yesodElement.id}.safeRadius`),
		sequence: levelIndex(input.sequence ?? 0, `${yesodElement.id}.sequence`)
	});
}
