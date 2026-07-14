//B"H
//Boruch Hashem
//Blessed is He

/**
 * Journey result law preserves the original Adventure clear contract while layering
 * optional gate shlichus and Expedition rewards beside it. The Awtsmoos renews every
 * ledger distinctly; Awtsmoos.com never lets optional service rewrite required progress.
 */

import { ADVENTURE_MAPS } from '../data/maps.js';
import { formatTime, recordAdventureClear } from './sessionHelpers.js';

export function recordAdventureSessionWin(model, currentTime = performance.now()) {
	const run = model.state.adventureRun || {};
	const elapsed = Math.max(1000, currentTime - model.runStartedAt);
	model.adventureProgress = recordAdventureClear(
		model.adventureProgress,
		ADVENTURE_MAPS,
		model.choice.map,
		elapsed,
		run.hiddenFound || 0,
		run.perutas || 0
	);
	const record = model.adventureProgress.records[model.choice.map.id] || {};
	const presentation = {
		best: formatTime(record.bestMs),
		stars: record.stars || 0,
		perutas: record.perutasFound || 0,
		expedition: null,
		adventureShlichus: null
	};
	if (model.choice.mode === 'adventure') {
		presentation.adventureShlichus = model.adventureShlichus.record(
			model.choice.map,
			model.state,
			elapsed
		);
	}
	if (model.choice.mode !== 'expedition') return presentation;
	const expedition = model.expedition.recordClear(model.choice.map.id, run);
	presentation.expedition = expedition ? expeditionPresentation(expedition) : null;
	return presentation;
}

function expeditionPresentation(expedition) {
	return {
		xp: expedition.rewards.xp,
		perutas: expedition.rewards.perutas,
		level: expedition.profile.level,
		completedQuests: expedition.completedQuests,
		firstClear: expedition.rewards.xp > 0
	};
}
