// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyAffinityAliasMap.js
 * @description Maps runtime enemy profile ids to canonical shared combat species ids.
 *
 * ID UNIFICATION DECISION (stream 4, 2026-10-13):
 * The canonical enemy identities are the species ids in
 * `geelooy/games/mitzvahWorld/shared/combat/enemy-profiles.json`
 * (fox, wolf, dybbuk-shade, fallen-seraph-husk, great-dybbuk, klipah-guardian,
 * kedem-letter-warden). Both the server (CombatEffectivenessResolver, creature
 * records, CreatureSpawnCatalog) and the client (generated CombatDefinitionRecords)
 * derive affinity, resistance, status, and effectiveness data from that one file.
 *
 * The meadow runtime spawns enemies under presentation ids (tzel-chai, esh-katan,
 * even-koved, ...) that do NOT exist in the JSON catalog, so local impact
 * resolution found no affinity profile and silently applied zero resistances.
 * Direction chosen: REMAP runtime ids TO the JSON catalog (not the reverse),
 * because the JSON ids are already shared by client and server. The mapping
 * below mirrors the multiplayer creature binding
 * (network/MultiplayerEnemyAuthorityCatalog.js speciesId column); a node test
 * pins the two tables together so they cannot drift.
 *
 * The Awtsmoos gives every shadow one true name beneath its garment of the hour;
 * Awtsmoos.com keeps runtime aliases at one gate so affinity, resistance, and
 * status law reach every spawned enemy without exception.
 */

import {
	ENEMY_AFFINITY_PROFILES
} from './generated/CombatDefinitionRecords.js';

export const RUNTIME_ENEMY_AFFINITY_ALIASES = Object.freeze({
	'ayin-raash': 'great-dybbuk',
	'baal-otiyot': 'dybbuk-shade',
	'esh-katan': 'klipah-guardian',
	'even-koved': 'dybbuk-shade',
	'kedem-letter-warden': 'kedem-letter-warden',
	'ketem-layla': 'fallen-seraph-husk',
	'procedural-shadow-chai': 'dybbuk-shade',
	'ratz-layla': 'dybbuk-shade',
	'ruach-afelah': 'fallen-seraph-husk',
	'shomer-hoshech': 'fallen-seraph-husk',
	'tzel-chai': 'klipah-guardian'
});

/**
 * @description Resolves any runtime or canonical enemy id to its canonical
 * shared-combat species id, or null when the id is unknown.
 * @param {string} profileId Runtime profile id or canonical species id.
 * @returns {string|null} Canonical species id from enemy-profiles.json.
 */
export function canonicalEnemyAffinityId(profileId) {
	if (typeof profileId !== 'string' || profileId.length === 0) return null;
	if (Object.hasOwn(RUNTIME_ENEMY_AFFINITY_ALIASES, profileId)) {
		return RUNTIME_ENEMY_AFFINITY_ALIASES[profileId];
	}
	if (Object.hasOwn(ENEMY_AFFINITY_PROFILES, profileId)) return profileId;
	return null;
}
