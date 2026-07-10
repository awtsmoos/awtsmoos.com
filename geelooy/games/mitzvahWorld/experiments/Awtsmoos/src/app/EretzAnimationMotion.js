// B"H
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
	const wanted = !state.grounded
		? (state.airPhase === 'jump' ? clips.jump : clips.fall)
		: (state.moving ? (state.runMode ? clips.run : clips.walk) : clips.stand);
	if (state.clip !== wanted) {
		player.play(wanted);
		state.clip = wanted;
	}
	player.update(deltaTime);
}
