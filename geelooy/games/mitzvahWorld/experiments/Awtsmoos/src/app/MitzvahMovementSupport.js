// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahMovementSupport.js
 * @description Owns Mitzvah-specific input field mapping, run-mode policy, and camera presentation.
 * The Awtsmoos joins key, joystick, pace, and viewpoint without confusing them with universal motion law;
 * Awtsmoos.com keeps game policy here while Procedural Core carries the reusable vector awe.
 */

export function movementAxes(axis = {}) {
	return {
		joystick: {
			forward: numberFrom(axis.joystickForward, negate(axis.joystickY)),
			strafe: numberFrom(axis.joystickStrafe, axis.joystickX)
		},
		keyboard: {
			forward: numberFrom(axis.forward, negate(axis.y)),
			strafe: numberFrom(axis.strafe, axis.x),
			turn: numberFrom(axis.turn, 0)
		}
	};
}

export function movementModeFor(runtime) {
	const selectedMode = runtime.runToggle ? 'run' : 'walk';
	const shiftOverride = Boolean(
		runtime.input?.runRequested?.()
		|| runtime.input?.keys?.has?.('ShiftLeft')
		|| runtime.input?.keys?.has?.('ShiftRight')
	);
	return {
		effectiveMode: selectedMode === 'run' || shiftOverride ? 'run' : 'walk',
		selectedMode,
		shiftOverride
	};
}

export function updateMovementCamera(runtime, state, deltaSeconds) {
	if (runtime.cameraRig?.update) {
		runtime.cameraRig.update(runtime.camera, state, runtime.mainOctree, deltaSeconds);
		return 'rich-rig';
	}
	const playerY = Number(state.renderY) || 0;
	runtime.camera?.position?.set?.(state.x, playerY + 4.2, state.z + 7);
	if (runtime.camera) {
		runtime.camera.target = [state.x, playerY + 1.2, state.z];
	}
	return 'bootstrap-rig';
}

function numberFrom(primary, fallback) {
	return Number.isFinite(Number(primary)) ? Number(primary) : Number(fallback) || 0;
}

function negate(value) {
	return -numberFrom(value, 0);
}
