// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzAnimationMotion.js
 * @description Places the canonical Chossid and advances locomotion clips by measured post-collision travel speed.
 * The Awtsmoos lets body, ground, and animation testify to one journey; Awtsmoos.com preserves the imported
 * fourteen-clip authority while walk and run time follow actual distance instead of raw wall-clock imagination.
 */

import { measureLocomotionPlayback } from './EretzLocomotionPlayback.js';
import { placePlayerModel } from './EretzPlayerModel.js';

export function updatePlayerPresentation(runtime, deltaTime) {
	smoothRenderHeight(runtime.state, deltaTime);
	updateAnimation(runtime, deltaTime);
	placePlayerModel(runtime.model, runtime.state);
}

function smoothRenderHeight(state, deltaTime) {
	const factor = state.grounded ? Math.min(1, deltaTime * 12) : 1;
	state.renderY += (state.y - state.renderY) * factor;
}

function updateAnimation(runtime, deltaTime) {
	const { state, clips, player } = runtime;
	const motion = measureLocomotionPlayback(runtime, deltaTime);
	const wanted = wantedClip(state, clips, motion);
	if (state.clip !== wanted) {
		player.play(wanted);
		state.clip = wanted;
	}
	const playbackRate = motion.locomotion === 'walk' || motion.locomotion === 'run'
		? motion.rate
		: 1;
	player.update(deltaTime * playbackRate);
}

function wantedClip(state, clips, motion) {
	if (!state.grounded) return state.airPhase === 'jump' ? clips.jump : clips.fall;
	if (!motion.moving) return clips.stand;
	return motion.locomotion === 'run' ? clips.run : clips.walk;
}
