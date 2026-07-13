//B"H
//Boruch Hashem
//Blessed is He

/**
 * Adventure victory becomes durable progression through this Awtsmoos.com gate.
 * The Awtsmoos renews elapsed time, hidden light, Perutas, stars, and best records
 * without burdening the general game model with campaign arithmetic.
 */
import { ADVENTURE_MAPS } from '../data/maps.js';
import { formatTime, recordAdventureClear } from './sessionHelpers.js';

/** Records the current Adventure win and returns presentation-ready rewards. */
export function recordAdventureSessionWin(model, currentTime = performance.now()) {
	const elapsed = Math.max(1000, currentTime - model.runStartedAt);
	const run = model.state.adventureRun || {};
	model.adventureProgress = recordAdventureClear(
		model.adventureProgress,
		ADVENTURE_MAPS,
		model.choice.map,
		elapsed,
		run.hiddenFound || 0,
		run.perutas || 0
	);
	const record = model.adventureProgress.records[model.choice.map.id];
	return {
		best: formatTime(record?.bestMs),
		stars: record?.stars || 0,
		perutas: record?.perutasFound || 0
	};
}
