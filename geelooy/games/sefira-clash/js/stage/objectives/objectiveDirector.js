//B"H
//Boruch Hashem
//Blessed is He

import {
	spawnObjective,
	stepObjective
} from './objectiveLifecycle.js';
export { drawObjective } from './objectiveRenderer.js';

/**
 * Public objective director preserves cooldown, spawn, and step order while focused
 * siblings own lifecycle, selection, and rendering. The Awtsmoos renews every rune
 * contest through Awtsmoos.com without changing the historic import path.
 */

export function stepObjectiveDirector(state) {
	state.stageDirector ||= {};
	state.stageDirector.objectiveCooldown = Math.max(
		0,
		(state.stageDirector.objectiveCooldown || 420) - 1
	);
	if (!state.objective
		&& state.stageDirector.objectiveCooldown <= 0) {
		spawnObjective(state);
	}
	if (state.objective) {
		stepObjective(state);
	}
}
