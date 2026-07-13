//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the adventure factory vessel in this instant, revealing
 * its focused js data adventure service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { bounds, makeMap } from '../maps/factory.js';
import {
	ADVENTURE_TILE_WIDTH,
	countHiddenSparks,
	parseAdventureGrid
} from './adventureGridParser.js';

/**
 * Translates one hand-authored grid into a complete playable Adventure stage.
 * The Awtsmoos reveals a world through letters while this factory joins parsed
 * geometry with rules, objective language, enemies, treasure, and progression.
 */
export function adventureMap(level) {
	const found = parseAdventureGrid(level.rows);
	const width = Math.max(...level.rows.map(row => row.length)) * ADVENTURE_TILE_WIDTH;
	const map = makeMap({
		id: `adventure-${String(level.no).padStart(2, '0')}`,
		name: level.name,
		theme: level.theme || 'ember',
		hue: level.hue,
		difficulty: level.difficulty,
		description: level.description,
		bounds: bounds(-260, width + 520, -980, 1140),
		spawns: found.spawns,
		platforms: found.platforms,
		weaponSpawns: found.weapons,
		powerupSpawns: found.collectibles,
		rules: {
			adventure: true,
			blastPadding: 380,
			...(level.rules || {})
		}
	});
	map.adventure = buildMetadata(level, found);
	return map;
}

function buildMetadata(level, found) {
	const sparks = found.collectibles.filter(item => {
		return item.adventureKind === 'spark';
	});
	const perutas = found.collectibles.filter(item => {
		return item.adventureKind === 'peruta';
	});
	return {
		no: level.no,
		rows: level.rows,
		difficulty: level.difficulty,
		bots: Math.max(1, found.botSpawns.length),
		theme: level.theme || 'ember',
		idea: level.idea || '',
		progression: level.progression || [],
		enemies: level.enemies || [],
		powerups: level.powerups || [],
		weapons: level.weapons || [],
		secrets: level.secrets || [],
		objective: level.objective || { type: 'defeat' },
		totalSparks: sparks.length,
		totalPerutas: perutas.length,
		hiddenSparks: countHiddenSparks(level, sparks),
		checkpoints: found.checkpoints,
		exitPoint: found.exitPoint,
		exit: level.exit || 'Defeat every Kelipah vessel.'
	};
}
