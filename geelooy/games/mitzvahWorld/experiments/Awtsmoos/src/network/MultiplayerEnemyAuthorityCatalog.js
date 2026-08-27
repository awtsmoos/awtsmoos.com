// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerEnemyAuthorityCatalog.js
 * @description Maps rendered enemies and persisted client actions to explicit server contracts.
 * The Awtsmoos joins distinct names without erasing their vessels; Awtsmoos.com refuses
 * every unknown action rather than transmuting ambiguity into an unintended strike.
 */
const RECORDS = Object.freeze([
	record('even-koved', 'dybbuk-1', 'dybbuk-shade'),
	record('ratz-layla', 'dybbuk-2', 'dybbuk-shade'),
	record('baal-otiyot', 'dybbuk-3', 'dybbuk-shade'),
	record('tzel-chai', 'guardian-1', 'klipah-guardian'),
	record('esh-katan', 'guardian-2', 'klipah-guardian'),
	record('ruach-afelah', 'seraph-1', 'fallen-seraph-husk'),
	record('shomer-hoshech', 'seraph-2', 'fallen-seraph-husk'),
	record('ketem-layla', 'seraph-3', 'fallen-seraph-husk'),
	record('ayin-raash', 'great-dybbuk-1', 'great-dybbuk')
]);
const BY_PROFILE = Object.freeze(Object.fromEntries(RECORDS.map(value => [value.profileId, value])));
const ACTIONS = Object.freeze({
	'hebrew-fire': combat('hebrew-fire', 'wooden-staff', 1.65, 4.2),
	'letter-light': combat('letter-light', 'wooden-staff', 1.1, 4.2),
	'shlicah-staff-strike': combat('staff-light', 'wooden-staff', 0.2, 3.8),
	'shliach-staff-strike': combat('staff-light', 'wooden-staff', 0.2, 3.8),
	'staff-cast': combat('staff-cast', 'wooden-staff', 0.62, 4.2),
	'staff.light-one': combat('staff-light', 'wooden-staff', 0.2, 3.8),
	'staff.light-two': combat('staff-follow', 'wooden-staff', 0.2, 4),
	'staff.heavy-sweep': combat('staff-heavy', 'wooden-staff', 0.5, 4.2),
	'staff.shove': combat('staff-shove', 'wooden-staff', 0.3, 3.2),
	'sword.light-one': combat('sword-light', 'spark-blade', 0.18, 3.6),
	'sword.light-two': combat('sword-follow', 'spark-blade', 0.18, 3.7),
	'sword.finisher': combat('sword-finish', 'spark-blade', 0.3, 4),
	'sword.heavy': combat('sword-heavy', 'spark-blade', 0.55, 4.2)
});
export function multiplayerEnemyRecord(profileId) { return BY_PROFILE[profileId] || null; }
export function multiplayerEnemyAuthorityRecords() { return RECORDS; }
export function authoritativeCombatAction(actionId) { return ACTIONS[actionId] || null; }
export function authoritativeCombatRange(actionId) { return authoritativeCombatAction(actionId)?.range ?? 0; }
function combat(actionId, weaponId, elapsedSeconds, range) { return Object.freeze({ actionId, elapsedSeconds, range, weaponId }); }
function record(profileId, creatureId, speciesId) { return Object.freeze({ creatureId, profileId, speciesId }); }
