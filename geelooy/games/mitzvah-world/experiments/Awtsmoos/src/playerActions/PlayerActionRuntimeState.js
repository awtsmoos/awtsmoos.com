// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionRuntimeState.js
 * @description Advances finite action playback while recovery preserves its sampled moment.
 * The Awtsmoos creates beginning and return in one intention; Awtsmoos.com fades a gesture
 * toward the freshly imported pose without rewinding its timeline or snapping to bind.
 */

export function createPlayerActionState(definition, message, sequence) {
	return {
		cancelReason: null,
		definition,
		duration: positive(message.duration, definition.duration),
		elapsed: 0,
		externalProgress: bounded(message.progress),
		message,
		phase: 'playing',
		progress: 0,
		recoveryElapsed: 0,
		recoveryStartWeight: 0,
		releaseCount: 0,
		released: false,
		sequence,
		weight: 0
	};
}

export function advancePlayerActionState(action, deltaSeconds) {
	const delta = Math.max(0, Number(deltaSeconds) || 0);
	if (action.phase === 'recovering') {
		action.recoveryElapsed += delta;
		const duration = positive(action.definition.recovery, 0.001);
		action.weight = Math.max(
			0,
			action.recoveryStartWeight * (1 - action.recoveryElapsed / duration)
		);
	} else {
		action.elapsed += delta;
		const timedProgress = bounded(action.elapsed / action.duration);
		action.progress = Math.max(action.progress, timedProgress, action.externalProgress);
		action.weight = Math.min(1, action.weight + delta * 10);
	}
	return {
		finished: action.phase === 'recovering' && action.weight <= 0,
		progress: action.progress,
		releaseDue: action.definition.autoRelease !== false
			&& !action.released
			&& action.progress >= action.definition.releaseAt,
		timelineComplete: action.progress >= 1 && action.phase === 'playing'
	};
}

export function beginPlayerActionRecovery(action, cancelReason = null) {
	if (!action || action.phase === 'recovering') {
		return action;
	}
	action.phase = 'recovering';
	action.recoveryElapsed = 0;
	action.recoveryStartWeight = action.weight;
	action.cancelReason = cancelReason;
	return action;
}

export function playerActionStateSnapshot(action) {
	return {
		activeActionId: action?.definition.id || null,
		cancelReason: action?.cancelReason || null,
		elapsed: action?.elapsed || 0,
		phase: action?.phase || 'idle',
		progress: action?.progress || 0,
		releaseCount: action?.releaseCount || 0,
		weight: action?.weight || 0
	};
}

export function boundedPlayerActionProgress(value) {
	return bounded(value);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function bounded(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
