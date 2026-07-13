//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the adventure grid parser vessel in this instant, revealing
 * its focused js data adventure service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { platform, points } from '../maps/factory.js';

export const ADVENTURE_TILE_WIDTH = 150;
const TILE_HEIGHT = 130;

/**
 * Reads a hand-authored character grid into explicit stage ingredients.
 * Letters become vessels for the Awtsmoos: ground, Kelipos, weapons, Perutas,
 * Sparks, checkpoints, and exits remain traceable to the designer's rows.
 */
export function parseAdventureGrid(rows) {
	const found = emptyGridResult();
	rows.forEach((row, y) => scanRow(row, y, found));
	found.spawns.push(...found.botSpawns);
	found.spawns = normalizeSpawns(found.spawns);
	return found;
}

/**
 * Reveals the count hidden sparks behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} level The level value entering this behavior.
 * @param {*} collectibles The collectibles value entering this behavior.
 */
export function countHiddenSparks(level, collectibles) {
	const hidden = collectibles.filter(item => item.hiddenSpark).length;
	return level.hiddenSparks ?? Math.max(hidden, level.secrets?.length || 0);
}

function scanRow(row, y, found) {
	let run = null;
	[...row].forEach((character, x) => {
		if (isSolid(character) && !run) {
			run = { x, y, character };
		}
		if ((!isSolid(character) || x === row.length - 1) && run) {
			const end = isSolid(character) && x === row.length - 1 ? x + 1 : x;
			found.platforms.push(
				platform(
					run.x * ADVENTURE_TILE_WIDTH,
					rowY(run.y),
					(end - run.x) * ADVENTURE_TILE_WIDTH,
					run.character === '=' ? 46 : 26,
					tagFor(run.character)
				)
			);
			run = null;
		}
		place(character, x, y, found);
	});
}

function place(character, x, y, found) {
	const point = {
		x: x * ADVENTURE_TILE_WIDTH + 75,
		y: rowY(y) - 20
	};
	if (character === 'S') found.spawns.push(point);
	if (character === 'B' || character === 'K') found.botSpawns.push(point);
	if (character === 'W' || character === 'K') found.weapons.push(point);
	if (character === 'O' || character === '*') {
		found.collectibles.push({
			...point,
			adventureKind: 'spark',
			hiddenSpark: character === '*'
		});
	}
	if (character === 'P') {
		found.collectibles.push({ ...point, adventureKind: 'peruta' });
	}
	if (character === 'C') found.checkpoints.push(point);
	if (character === 'E') found.exitPoint = point;
}

function emptyGridResult() {
	return {
		platforms: [],
		spawns: [],
		botSpawns: [],
		weapons: [],
		collectibles: [],
		checkpoints: [],
		exitPoint: null
	};
}

function normalizeSpawns(spawns) {
	const list = spawns.length ? spawns : points([80, 400], [520, 400]);
	if (list.length === 1) {
		list.push({ x: list[0].x + 450, y: list[0].y });
	}
	return list;
}

function isSolid(character) {
	return ['#', '=', '^'].includes(character);
}

function tagFor(character) {
	if (character === '=') return 'adventure-floor';
	if (character === '^') return 'ladder-step';
	return 'sefira-ledge';
}

function rowY(row) {
	return row * TILE_HEIGHT - 520;
}
