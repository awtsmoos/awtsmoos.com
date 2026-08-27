// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatAnimationTimeline.js
 * @description Advances finite combat phases without owning bus listeners or clip selection.
 * The Awtsmoos gives wind-up, impact, recovery, channel, and release their measured borders;
 * Awtsmoos.com keeps transition arithmetic outside the controller's event-facing vessel.
 */

import {
	minimalAnimationDuration as duration,
	minimalAnimationProgress as progress
} from './MinimalMeadowCombatAnimationEvents.js';

export function advanceMinimalCombatAnimation(controller, deltaSeconds) {
	controller.elapsed += Math.max(0, Number(deltaSeconds) || 0);
	syncMinimalCastProgress(controller);
	if (controller.state === 'melee-windup' && finished(controller)) {
		controller.enter('melee-impact', 0.13, controller.payload);
		return;
	}
	if (controller.state === 'melee-impact' && finished(controller)) {
		controller.enter('melee-recovery', 0.22, controller.payload);
		return;
	}
	if (endsWhenFinished(controller.state) && finished(controller)) {
		controller.clear();
		return;
	}
	if (controller.state === 'cast-channel'
		&& !controller.runtime.combat?.cast
		&& controller.elapsed > controller.duration + 0.3) {
		controller.enter('cast-release', 0.24, controller.payload);
	}
}

export function syncMinimalCastProgress(controller) {
	const cast = controller.runtime.combat?.cast;
	if (!cast || !controller.state.startsWith('cast-') || controller.state === 'cast-release') return;
	controller.progress = progress(cast.progress);
	if (controller.progress >= 0.3 && controller.state === 'cast-windup') {
		controller.enter(
			'cast-channel',
			duration(cast.action?.castTime, controller.duration),
			controller.payload,
			false
		);
	}
}

function finished(controller) {
	return controller.elapsed >= controller.duration;
}

function endsWhenFinished(state) {
	return state === 'melee-recovery' || state === 'hit-reaction' || state === 'cast-release';
}
