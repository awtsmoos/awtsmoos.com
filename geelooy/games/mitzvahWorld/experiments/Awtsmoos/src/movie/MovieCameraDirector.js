// B"H
/**
 * @file MovieCameraDirector.js
 * @description Applies cinematic JSON shots directly to the real tiny-runtime camera.
 */
import { lerpPoint } from './MovieEasing.js';

function actorTarget(runtime, name) {
	if (name === 'npc') {
		return {
			x: runtime.npc.x,
			y: runtime.npc.model.position.y + 1.7,
			z: runtime.npc.z
		};
	}
	return {
		x: runtime.state.x,
		y: runtime.state.renderY + runtime.state.faceHeight,
		z: runtime.state.z
	};
}

function endpointTarget(runtime, endpoint = {}) {
	return endpoint.targetActor
		? actorTarget(runtime, endpoint.targetActor)
		: { ...(endpoint.target || actorTarget(runtime, 'player')) };
}

export class MovieCameraDirector {
	constructor(runtime) {
		this.runtime = runtime;
		this.currentShot = '';
	}

	apply(cameraState) {
		if (!cameraState) return;
		const { clip, eased } = cameraState;
		const from = clip.from || clip.to || {};
		const to = clip.to || clip.from || {};
		const position = lerpPoint(from.position, to.position, eased);
		const target = lerpPoint(
			endpointTarget(this.runtime, from),
			endpointTarget(this.runtime, to),
			eased
		);
		this.runtime.camera.position.set(position.x, position.y, position.z);
		this.runtime.camera.target = [target.x, target.y, target.z];
		this.currentShot = clip.shot || cameraState.track.id;
		this.runtime.camera.userData ||= {};
		this.runtime.camera.userData.AwtsmoosMovieShot = {
			id: clip.id,
			shot: this.currentShot,
			progress: cameraState.progress,
			position,
			target
		};
	}
}

export default MovieCameraDirector;
