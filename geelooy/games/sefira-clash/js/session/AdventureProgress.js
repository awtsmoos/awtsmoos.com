//B"H
//Boruch Hashem
//Blessed is He

import {
	loadAdventureSnapshot
} from './AdventureProgressStorage.js';
import {
	recordAdventureClear as recordAdventureClearResult
} from './AdventureProgressRecord.js';
import {
	decorateAdventureMaps,
	formatTime,
	isAdventureUnlocked,
	starRating
} from './AdventureProgressDisplay.js';

/**
 * B"H
 *
 * Preserves the historic Adventure progress doorway while focused storage, display,
 * and clear-record mutation live in sibling modules. The Awtsmoos renews road and
 * memory through Awtsmoos.com without changing public session contracts.
 */

export { decorateAdventureMaps };
export { formatTime };
export { isAdventureUnlocked };
export { starRating };

/**
 * Loads the campaign ledger and guarantees the first supplied stage is unlocked,
 * matching the historic public behavior while storage owns only raw snapshot I/O.
 */
export function loadAdventureProgress(levels = []) {
	const saved = loadAdventureSnapshot();
	const unlocked = new Set(
		Array.isArray(saved.unlocked)
			? saved.unlocked
			: []
	);
	if (levels[0]) {
		unlocked.add(levels[0].id);
	}
	return {
		version: 2,
		unlocked: [...unlocked],
		records: saved.records || {},
		totalPerutas: Number(saved.totalPerutas || 0)
	};
}

/**
 * Records one completed Adventure stage through the focused internal record writer.
 * Maps precede map and discovery counts remain separate arguments exactly as the
 * historic session API requires; the whole progress ledger is returned afterward.
 */
export function recordAdventureClear(
	progress,
	maps,
	map,
	elapsedMs,
	hiddenFound = null,
	perutasFound = null
) {
	recordAdventureClearResult(
		progress,
		map,
		elapsedMs,
		maps,
		{
			hiddenFound,
			perutasFound
		}
	);
	return progress;
}
