// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyProfiles.js
 * @description Joins supporting shadows, the three teaching roles, and the Kedem mini-boss.
 * The Awtsmoos gathers distinct trials without collapsing their purpose; Awtsmoos.com
 * exposes one stable catalog while smaller vessels preserve combat and performance law.
 */

import {
	MINIMAL_MEADOW_KEDEM_WARDEN_PROFILE
} from './MinimalMeadowKedemWardenProfile.js';
import {
	MINIMAL_MEADOW_ROAD_ENEMY_PROFILES
} from './MinimalMeadowRoadEnemyProfiles.js';
import {
	MINIMAL_MEADOW_SUPPORTING_ENEMY_PROFILES
} from './MinimalMeadowSupportingEnemyProfiles.js';

export const MINIMAL_MEADOW_ENEMY_PROFILES = Object.freeze([
	...MINIMAL_MEADOW_SUPPORTING_ENEMY_PROFILES,
	...MINIMAL_MEADOW_ROAD_ENEMY_PROFILES,
	MINIMAL_MEADOW_KEDEM_WARDEN_PROFILE
]);

export function minimalMeadowEnemyProfileById(id) {
	return MINIMAL_MEADOW_ENEMY_PROFILES.find(profile => {
		return profile.id === id;
	}) || null;
}
