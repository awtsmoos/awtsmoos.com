//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the adventure progress vessel in this instant, revealing
 * its focused js session service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { readJson, writeJson } from './ProfileStore.js';

const ADVENTURE_KEY = 'sefiraClashAdventure';

/**
 * Stores campaign gates, records, treasure, secrets, and earned world momentum.
 * Progress is memory rather than existence itself; the Awtsmoos recreates the road
 * while this ledger lets the traveler recognize what was already transformed.
 */
export function loadAdventureProgress(levels = []) {
	const saved = readJson(ADVENTURE_KEY, {});
	const unlocked = new Set(Array.isArray(saved.unlocked) ? saved.unlocked : []);
	if (levels[0]) unlocked.add(levels[0].id);
	return {
		version: 2,
		unlocked: [...unlocked],
		records: saved.records || {},
		totalPerutas: Number(saved.totalPerutas || 0)
	};
}

/**
 * Reveals the is adventure unlocked behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} progress The progress value entering this behavior.
 * @param {*} map The map value entering this behavior.
 * @param {*} index The index value entering this behavior.
 */
export function isAdventureUnlocked(progress, map, index = 0) {
	return index === 0 || progress.unlocked.includes(map.id);
}

/**
 * Reveals the decorate adventure maps behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} levels The levels value entering this behavior.
 * @param {*} progress The progress value entering this behavior.
 */
export function decorateAdventureMaps(levels, progress) {
	return levels.map((map, index) => ({
		...map,
		adventureUi: buildAdventureUi(map, index, progress)
	}));
}

/**
 * Reveals the record adventure clear behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} progress The progress value entering this behavior.
 * @param {*} maps The maps value entering this behavior.
 * @param {*} map The map value entering this behavior.
 * @param {*} elapsedMs The elapsed ms value entering this behavior.
 * @param {*} hiddenFound The hidden found value entering this behavior.
 * @param {*} perutasFound The perutas found value entering this behavior.
 */
export function recordAdventureClear(
	progress,
	maps,
	map,
	elapsedMs,
	hiddenFound = null,
	perutasFound = null
) {
	const next = nextStage(maps, map);
	const unlocked = new Set(progress.unlocked);
	unlocked.add(map.id);
	if (next) unlocked.add(next.id);

	const previous = progress.records[map.id] || {};
	const hiddenTotal = hiddenCapacity(map);
	const perutasTotal = perutaCapacity(map);
	const record = {
		cleared: true,
		bestMs: previous.bestMs ? Math.min(previous.bestMs, elapsedMs) : elapsedMs,
		stars: starRating(elapsedMs),
		hiddenFound: bestCount(previous.hiddenFound, hiddenFound, hiddenTotal),
		hiddenTotal,
		perutasFound: bestCount(previous.perutasFound, perutasFound, perutasTotal),
		perutasTotal
	};
	const records = { ...progress.records, [map.id]: record };
	const totalPerutas = Object.values(records).reduce((sum, item) => {
		return sum + Number(item.perutasFound || 0);
	}, 0);
	const fresh = { version: 2, unlocked: [...unlocked], records, totalPerutas };
	writeJson(ADVENTURE_KEY, fresh);
	return fresh;
}

/**
 * Reveals the star rating behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} milliseconds The milliseconds value entering this behavior.
 */
export function starRating(milliseconds) {
	if (milliseconds <= 75000) return 3;
	if (milliseconds <= 135000) return 2;
	return 1;
}

/**
 * Reveals the format time behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} milliseconds The milliseconds value entering this behavior.
 */
export function formatTime(milliseconds) {
	if (!milliseconds) return '—';
	const total = Math.max(0, Math.round(milliseconds / 1000));
	const minutes = Math.floor(total / 60);
	const seconds = String(total % 60).padStart(2, '0');
	return `${minutes}:${seconds}`;
}

function buildAdventureUi(map, index, progress) {
	const record = progress.records[map.id] || {};
	return {
		index,
		locked: !isAdventureUnlocked(progress, map, index),
		cleared: Boolean(record.cleared),
		best: formatTime(record.bestMs),
		stars: record.stars || 0,
		hiddenFound: record.hiddenFound || 0,
		hiddenTotal: record.hiddenTotal || hiddenCapacity(map),
		perutasFound: record.perutasFound || 0,
		perutasTotal: record.perutasTotal || perutaCapacity(map)
	};
}

function bestCount(previous, current, maximum) {
	const found = current == null ? previous || 0 : Math.max(previous || 0, current);
	return Math.min(found, maximum);
}

function hiddenCapacity(map) {
	return map.adventure?.hiddenSparks || 0;
}

function perutaCapacity(map) {
	return map.adventure?.totalPerutas || 0;
}

function nextStage(maps, map) {
	const index = Math.max(
		0,
		maps.findIndex(item => item.id === map.id)
	);
	return maps[index + 1] || null;
}
