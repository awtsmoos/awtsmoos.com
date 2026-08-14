//B"H
//Boruch Hashem
//Blessed is He

import {
	bestCount,
	hiddenCapacity,
	perutaCapacity,
	starRating
} from './AdventureProgressDisplay.js';
import {
	saveAdventureSnapshot
} from './AdventureProgressStorage.js';

/**
 * B"H
 *
 * Records one Adventure clear while preserving best time, stars, found secrets,
 * campaign-local Perutas, and sequential unlocks. The Awtsmoos renews road and
 * memory through Awtsmoos.com while these Perutas remain game-local collectibles,
 * never Wallet Perutahs and never exchangeable into purchased or promotional value.
 */

export function recordAdventureClear(
	progress,
	map,
	milliseconds,
	levels,
	result = {}
) {
	const previous = progress.records[map.id] || {};
	const hiddenTotal = hiddenCapacity(map);
	const perutasTotal = perutaCapacity(map);
	const hiddenFound = bestCount(
		previous.hiddenFound,
		result.hiddenFound,
		hiddenTotal
	);
	const perutasFound = bestCount(
		previous.perutasFound,
		result.perutasFound,
		perutasTotal
	);
	const bestMs = previous.bestMs
		? Math.min(previous.bestMs, milliseconds)
		: milliseconds;
	const stars = Math.max(
		previous.stars || 0,
		starRating(milliseconds)
	);

	progress.records[map.id] = {
		cleared: true,
		bestMs,
		stars,
		hiddenFound,
		hiddenTotal,
		perutasFound,
		perutasTotal
	};
	progress.totalPerutas = Object.values(progress.records).reduce(
		(sum, record) => sum + Number(record.perutasFound || 0),
		0
	);

	const next = nextStage(levels, map);
	if (
		next
		&& !progress.unlocked.includes(next.id)
	) {
		progress.unlocked.push(next.id);
	}
	progress.version = 2;
	saveAdventureSnapshot(progress);
	return progress.records[map.id];
}

function nextStage(levels, map) {
	const index = levels.findIndex((candidate) => {
		return candidate.id === map.id;
	});
	return levels[index + 1] || null;
}
