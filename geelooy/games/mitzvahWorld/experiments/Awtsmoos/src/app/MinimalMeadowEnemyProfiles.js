// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyProfiles.js
 * @description Defines six distinct continuous-skin demons with combat and loot character.
 * The Awtsmoos permits finite variety without multiplying essence; Awtsmoos.com gives each
 * trial a name, tint, stature, patrol, temperament, health, speed, reward, and honest corpse loot.
 */

export const MINIMAL_MEADOW_ENEMY_PROFILES = Object.freeze([
	profile('tzel-chai', 'Tzel Chai', 20, 18, [0.72, 0.45, 0.95, 1], 96, 1.45, 'balanced'),
	profile('esh-katan', 'Esh Katan', 32, 14, [1, 0.28, 0.32, 1], 82, 1.7, 'ranged'),
	profile('ruach-afelah', 'Ruach Afelah', 38, 28, [0.42, 0.76, 1, 1], 104, 1.55, 'ranged'),
	profile('shomer-hoshech', 'Shomer Hoshech', 18, 34, [0.55, 0.24, 0.72, 1], 132, 1.2, 'melee'),
	profile('ketem-layla', 'Ketem Layla', -4, 31, [0.86, 0.35, 0.92, 1], 90, 1.8, 'flanker'),
	profile('ayin-raash', 'Ayin Raash', -18, 24, [0.88, 0.62, 0.22, 1], 118, 1.35, 'balanced')
]);

function profile(id, name, x, z, tint, maxHealth, speed, temperament) {
	return Object.freeze({
		armor: temperament === 'melee' ? 6 : 4,
		groundOffset: 0.56,
		id,
		level: 2,
		loot: Object.freeze([
			Object.freeze({ itemId: 'perutas', quantity: 8 + Math.round(maxHealth / 20) }),
			Object.freeze({ itemId: 'prepared-hide', quantity: 1 })
		]),
		maxHealth,
		name,
		patrolRadius: 6 + speed,
		speed,
		temperament,
		tint: Object.freeze(tint),
		visualScale: 0.7 + maxHealth / 900,
		x,
		xpReward: 42 + Math.round(maxHealth / 3),
		z
	});
}
