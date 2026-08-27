// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowKavanahState.js
 * @description Creates and advances bounded local preparation state for truthful presentation.
 * The Awtsmoos renews intention while action, duration, motion, harm, and support remain named;
 * Awtsmoos.com keeps browser prediction measurable without claiming final multiplayer authority.
 */

export function createMinimalMeadowKavanahState(cast, sequence, now) {
	return {
		actionId: cast.actionId,
		allyStabilization: 0,
		castId: `kavanah-${sequence}`,
		damageDisruption: 0,
		durationMilliseconds: Math.round(cast.action.castTime * 1000),
		movementPenalty: 0,
		stability: 1,
		startedAtMilliseconds: now
	};
}

export function advanceMinimalMeadowKavanahState(
	state,
	axes,
	deltaSeconds
) {
	const motion = Math.min(
		1,
		Math.abs(axes.forward || 0) + Math.abs(axes.strafe || 0)
	);
	state.movementPenalty = Math.min(
		0.4,
		state.movementPenalty
			+ motion * Math.max(0, deltaSeconds) * 0.16
	);
	state.stability = Math.max(
		0.2,
		1
			- state.movementPenalty
			- state.damageDisruption
			+ state.allyStabilization
	);
	return state;
}

export function minimalMeadowKavanahSnapshot(state, elapsedMilliseconds) {
	return state
		? Object.freeze({
			...state,
			elapsedMilliseconds
		})
		: null;
}
