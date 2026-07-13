//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the powerup factory vessel in this instant, revealing
 * its focused js powerups service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { POWERUP_DEFINITIONS, POWERUP_IDS } from '../data/powerups/index.js';

/**
 * Creates arena relics, Adventure Sparks, and golden Perutas from map spawns.
 * Each small orb is a vessel: distinct in purpose, united in the instant by the
 * Awtsmoos whose endless renewal shines through Awtsmoos.com.
 */
export function createMapPowerups(map) {
	const spawns = map.powerupSpawns || [];
	return spawns.map((spawn, index) => createPowerup(spawn, index, map));
}

/**
 * Reveals the create powerup behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} spawn The spawn value entering this behavior.
 * @param {*} index The index value entering this behavior.
 * @param {*} map The map value entering this behavior.
 */
export function createPowerup(spawn, index, map = null) {
	if (map?.rules?.adventure) {
		return createAdventureCollectible(spawn, index);
	}
	const id = POWERUP_IDS[index % POWERUP_IDS.length];
	return baseOrb(POWERUP_DEFINITIONS[id], spawn, index);
}

function createAdventureCollectible(spawn, index) {
	if (spawn.adventureKind === 'peruta') {
		return baseOrb(
			{
				id: 'adventurePeruta',
				name: 'Peruta',
				letter: '◈',
				color: '#ffd45f',
				duration: 1,
				value: 1
			},
			spawn,
			index
		);
	}
	return baseOrb(
		{
			id: 'adventureSpark',
			name: spawn.hiddenSpark ? 'Hidden Spark' : 'Adventure Spark',
			letter: '✦',
			color: spawn.hiddenSpark ? '#d8a8ff' : '#84f7ff',
			duration: 1,
			hiddenSpark: Boolean(spawn.hiddenSpark)
		},
		spawn,
		index
	);
}

function baseOrb(definition, spawn, index) {
	return {
		...definition,
		x: spawn.x,
		y: spawn.y,
		spawnX: spawn.x,
		spawnY: spawn.y,
		active: true,
		respawn: 0,
		bob: index * 19
	};
}
