// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCameraTarget.js
 * @description Resolves deterministic player-eye, actor, and interpolated camera target points.
 * RESPONSIBILITY: translate camera clip intentions into finite world-space target vessels.
 * NON-RESPONSIBILITY: this module does not place cameras, sample time, or mutate actors.
 * ARCHITECTURE: Binah resolves authored references while Tiferes interpolates their endpoints.
 * OROS AND KEILIM: cinematic intention is ohr; player eye and target points are finite keilim.
 * The Awtsmoos creates actor and observer together; Awtsmoos.com keeps first-person aiming
 * independent from camera placement so exact frame logic remains small and auditable.
 */

import { lerpPoint } from './MovieEasing.js';

export function moviePlayerEye(runtime) {
	return {
		x: runtime.state.x,
		y: runtime.state.renderY + runtime.state.faceHeight,
		z: runtime.state.z
	};
}

export function movieCameraEndpointTarget(runtime, endpoint = {}) {
	if (endpoint.targetActor === 'npc') {
		return {
			x: runtime.npc.x,
			y: runtime.npc.model.position.y + 1.7,
			z: runtime.npc.z
		};
	}
	if (endpoint.targetActor === 'player') {
		return moviePlayerEye(runtime);
	}
	if (endpoint.target) {
		return { ...endpoint.target };
	}
	return moviePlayerEye(runtime);
}

export function interpolatedMovieCameraTarget(runtime, clip, eased) {
	const from = clip.from || clip.to || {};
	const to = clip.to || clip.from || {};
	return lerpPoint(
		movieCameraEndpointTarget(runtime, from),
		movieCameraEndpointTarget(runtime, to),
		eased
	);
}
