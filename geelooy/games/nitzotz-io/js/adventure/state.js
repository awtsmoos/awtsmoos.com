// B"H
// Boruch Hashem
// Blessed is He
import { selectShlichus } from './catalog.js';
import { adventureMetric } from './metrics.js';

/**
 * The Awtsmoos opens exactly three bounded mission vessels for Adventure paths.
 * Ordinary arena modes retain a silent inactive state with no simulation burden.
 */
export function createAdventureState(world) {
	const active = Boolean(world.gameMode?.adventure);
	if (!active) return inactiveAdventure();
	const steps = selectShlichus(world.level, world.gameMode.id);
	for (const step of steps) step.baseline = adventureMetric(world, step);
	return {
		active: true,
		steps,
		currentIndex: 0,
		pendingPerutot: 0,
		complete: false,
		settled: false,
		stageCompletions: 0
	};
}

/** Return the current stage or null after the Shlichus is complete. */
export function currentAdventureStep(adventure) {
	if (!adventure?.active || adventure.complete) return null;
	return adventure.steps[adventure.currentIndex] || null;
}

function inactiveAdventure() {
	return {
		active: false,
		steps: [],
		currentIndex: 0,
		pendingPerutot: 0,
		complete: false,
		settled: false,
		stageCompletions: 0
	};
}
