// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzAnimationMotion.js
 * @description Places the canonical Chossid and advances locomotion without letting deferred clip names tear the rich-world frame.
 * The Awtsmoos lets body, ground, and animation testify to one journey while a late name remains only a late name;
 * Awtsmoos.com keeps the visible traveler moving through mountain promotion until the canonical clip-map enters the frame.
 */

import { RUN_SPEED, WALK_SPEED } from './EretzConstants.js';
import {
	advanceLocomotionStride,
	applyLocomotionStridePresentation,
	createLocomotionStride
} from './EretzLocomotionStride.js';
import { measureLocomotionPlayback } from './EretzLocomotionPlayback.js';
import { placePlayerModel } from './EretzPlayerModel.js';

/** Advances animation when its naming contract exists while always preserving visible model placement. */
export function updatePlayerPresentation(runtime, deltaTime) {
	smoothRenderHeight(runtime.state, deltaTime);
	updateAnimation(runtime, deltaTime);
	placePlayerModel(runtime.model, runtime.state);
	applyLocomotionStridePresentation(runtime.model, runtime.state, runtime.locomotionStrideState);
}

/** Smooths grounded vertical rendering while airborne motion follows physics immediately. */
function smoothRenderHeight(state, deltaTime) {
	const factor = state.grounded ? Math.min(1, deltaTime * 12) : 1;
	state.renderY += (state.y - state.renderY) * factor;
}

/** Keeps current authored motion alive during the brief interval before canonical clip names are published. */
function updateAnimation(runtime, deltaTime) {
	const { state, clips, player } = runtime;
	const motion = measureLocomotionPlayback(runtime, deltaTime);
	const stride = runtime.locomotionStrideState
		|| (runtime.locomotionStrideState = createLocomotionStride());
	advanceLocomotionStride(stride, {
		clipDuration: strideClipDuration(player, clips, motion.locomotion),
		deltaTime,
		facing: state.facing,
		locomotion: motion.locomotion,
		moving: motion.moving,
		referenceSpeed: motion.locomotion === 'run' ? RUN_SPEED : WALK_SPEED,
		speed: motion.speed
	});
	if (!clips || !player) {
		player?.update?.(deltaTime);
		return;
	}
	const wanted = wantedClip(state, clips, motion, stride);
	if (wanted && state.clip !== wanted && typeof player.play === 'function') {
		player.play(wanted);
		state.clip = wanted;
	}
	const playbackRate = motion.locomotion === 'walk' || motion.locomotion === 'run'
		? motion.rate
		: 1;
	player.update?.(deltaTime * playbackRate);
}

/** Resolves the authored clip-cycle duration so stride phase stays synchronized to visible feet. */
function strideClipDuration(player, clips, locomotion) {
	const name = locomotion === 'run' ? clips?.run : clips?.walk;
	const match = player?.clips?.find?.(clip => clip?.name === name);
	const duration = Number(match?.duration);
	return Number.isFinite(duration) && duration > 0 ? duration : 1;
}

/** Chooses the best published locomotion clip with a debounced label so walk/run cannot flutter at the boundary. */
function wantedClip(state, clips, motion, stride) {
	const stand = clips.stand || state.clip || '';
	if (!state.grounded) {
		return state.airPhase === 'jump'
			? (clips.jump || stand)
			: (clips.fall || clips.jump || stand);
	}
	const locomotion = stride?.smoothedLocomotion || motion.locomotion;
	if (locomotion !== 'walk' && locomotion !== 'run') return stand;
	return locomotion === 'run'
		? (clips.run || clips.walk || stand)
		: (clips.walk || stand);
}
