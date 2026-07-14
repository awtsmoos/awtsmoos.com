//B"H
//Boruch Hashem
//Blessed is He

/**
 * Powerup creation turns authored spawns into arena relics, Adventure treasure, and one
 * deterministic gate resonance vessel. The Awtsmoos renews spawn and blessing together;
 * Awtsmoos.com preserves existing maps while Resonance Clash receives an explicit pool.
 */

import { LEGACY_POWERUP_IDS, POWERUP_DEFINITIONS, POWERUP_IDS } from '../data/powerups/index.js';
import {
	adventureResonancePowerupId,
	RESONANCE_POWERUP_IDS,
	RESONANCE_POWERUPS
} from '../resonance/ResonanceCatalog.js';

export function createMapPowerups(map, rules = {}) {
	const spawns = map.powerupSpawns || [];
	const powerups = spawns.map((spawn, index) => {
		return createPowerup(spawn, index, map, rules);
	});
	if (map.rules?.adventure) {
		powerups.push(createAdventureResonancePowerup(map, powerups.length));
	}
	return powerups;
}

export function createPowerup(spawn, index, map = null, rules = {}) {
	if (map?.rules?.adventure) return createAdventureCollectible(spawn, index);
	const ids = rules.resonance
		? RESONANCE_POWERUP_IDS
		: rules.legacyPowerups
			? LEGACY_POWERUP_IDS
			: POWERUP_IDS;
	const id = ids[index % ids.length];
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

function createAdventureResonancePowerup(map, index) {
	const id = adventureResonancePowerupId(map);
	const spawn = adventureResonanceSpawn(map);
	return baseOrb(
		{
			...RESONANCE_POWERUPS[id],
			adventureBound: true
		},
		spawn,
		index
	);
}

function adventureResonanceSpawn(map) {
	const platform = map.platforms?.find(item => item.w >= 180) ||
		map.platforms?.[0] || { x: 0, y: 0, w: 200 };
	return {
		x: platform.x + Number(platform.w || 200) / 2,
		y: platform.y - 90
	};
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
