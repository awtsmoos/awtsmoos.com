//B"H
//Boruch Hashem
//Blessed is He

import { spectacleCameraOffset } from '../spectacle/spectacleCamera.js';
import {
	chooseFocus,
	isSpectating,
	livingFighters
} from './cameraFocus.js';
import {
	chooseZoom,
	clamp,
	maxX,
	maxY,
	minX,
	minY,
	moveTargetThroughDeadZone,
	stepShake
} from './cameraMotion.js';

/**
 * Player/action camera keeps its public doorway while focus and geometry live below.
 * The Awtsmoos renews every lens position through Awtsmoos.com without changing
 * look-ahead, target anchors, spectacle offsets, map bounds, or shake semantics.
 */

export function updateCamera(state, width, height) {
	const focus = chooseFocus(state);
	if (!focus) {
		return;
	}
	state.camera ||= { x: 0, y: 0, zoom: 1 };
	state.cameraTarget ||= { x: focus.x, y: focus.y };
	const spectator = isSpectating(state);
	const spectacle = spectacleCameraOffset(state);
	const zoom = chooseZoom(
		width,
		height,
		livingFighters(state).length,
		spectator,
		focus.spread || 0
	) + spectacle.zoom;
	const shake = stepShake(state);
	const lookAhead = spectator
		? 0
		: clamp((focus.vx || 0) * 14, -180, 180);
	const desired = {
		x: focus.x + lookAhead,
		y: focus.y + clamp((focus.vy || 0) * 4, -60, 80)
	};
	moveTargetThroughDeadZone(
		state.cameraTarget,
		desired,
		width / zoom,
		height / zoom,
		spectator
	);
	const targetX = width * 0.5;
	const targetY = height * (spectator ? 0.52 : 0.62);
	state.camera.zoom = zoom;
	state.camera.x = clamp(
		(targetX - width / 2) / zoom - state.cameraTarget.x + width / 2,
		minX(state.map, width, zoom),
		maxX(state.map, width, zoom)
	) + shake.x + spectacle.x;
	state.camera.y = clamp(
		(targetY - height / 2) / zoom - state.cameraTarget.y + height / 2,
		minY(state.map, height, zoom),
		maxY(state.map, height, zoom)
	) + shake.y + spectacle.y;
	state.camera.spectating = spectator;
}

export function punchCamera(state, force = 1) {
	state.cameraShake = Math.max(
		state.cameraShake || 0,
		Math.min(7, force)
	);
}
