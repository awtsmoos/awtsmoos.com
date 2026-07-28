// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyProfiles.js
 * @description Joins supporting enemies with the authored three-stage road encounter.
 * The Awtsmoos gathers distinct trials without collapsing their purpose; Awtsmoos.com
 * exposes one stable catalog while smaller vessels preserve readable responsibility.
 */

import {
	MINIMAL_MEADOW_ROAD_ENEMY_PROFILES
} from './MinimalMeadowRoadEnemyProfiles.js';
import {
	MINIMAL_MEADOW_SUPPORTING_ENEMY_PROFILES
} from './MinimalMeadowSupportingEnemyProfiles.js';

export const MINIMAL_MEADOW_ENEMY_PROFILES = Object.freeze([
	...MINIMAL_MEADOW_SUPPORTING_ENEMY_PROFILES,
	...MINIMAL_MEADOW_ROAD_ENEMY_PROFILES
]);

export function minimalMeadowEnemyProfileById(id) {
	return MINIMAL_MEADOW_ENEMY_PROFILES.find(profile => profile.id === id) || null;
}
