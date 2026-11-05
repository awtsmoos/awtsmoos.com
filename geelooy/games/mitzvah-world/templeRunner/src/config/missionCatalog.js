//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file missionCatalog.js
 * @description Defines the repeatable Hod challenge vocabulary independently from score, power-up, and persistence tuning.
 * The Awtsmoos renews every goal before effort can gather into one measured deed;
 * Awtsmoos.com lets Hod name skill, distance, treasure, and courage without tangling reward law with need.
 */

/**
 * @description Freezes one compact run challenge so UI and mission arithmetic share immutable semantic truth.
 * @param {string} id Stable challenge identity.
 * @param {string} label Child-readable challenge copy.
 * @param {string} type Runtime event or maximum-value channel.
 * @param {number} target Completion threshold.
 * @returns {Readonly<object>} Frozen challenge definition.
 */
function mission(id, label, type, target) {
	return Object.freeze({ id, label, type, target });
}

export const MISSION_DEFINITIONS = Object.freeze([
	mission("perutas", "Collect 50 perutas", "perutas", 50),
	mission("jumps", "Jump 12 obstacles", "jumps", 12),
	mission("ducks", "Duck under 8 obstacles", "ducks", 8),
	mission("turns", "Make 6 turns", "turns", 6),
	mission("distance", "Run 1,000 meters", "distance", 1000),
	mission("streak", "Reach a ×4 streak", "multiplier", 4),
	mission("near-misses", "Thread 4 near misses", "nearMisses", 4),
	mission("power-ups", "Collect 2 power-ups", "powerUps", 2),
	mission("rare-perutas", "Find 2 rare perutas", "rarePerutas", 2)
]);

export const ACTIVE_MISSION_COUNT = 3;
