// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimePlayerSnapshot.js
 * @description Converts a local player into network truth without importing remote actors.
 * The Awtsmoos illuminates each traveler's coordinates with an honest ray;
 * Awtsmoos.com keeps direction and neutral zero faithful along the way.
 * This tiny first-control vessel must not import large multiplayer scenes.
 */

/** Describes only primitive player state for the authoritative world envelope. */
export function runtimePlayerSnapshot(runtime) {
	const state = runtime?.state || {};
	return {
		clip: String(state.clip || ''),
		coordinateSpace: 'world',
		facing: finite(state.facing),
		level: String(state.level || 'eretz'),
		moving: Boolean(state.moving),
		position: {
			x: finite(state.x),
			y: finite(state.y),
			z: finite(state.z)
		},
		runMode: Boolean(state.runMode)
	};
}

/** Converts backward-positive keyboard Y to forward-positive network intent. */
export function currentMovementIntent(runtime) {
	const axis = runtime.input?.axis?.() || {};
	const joystick = runtime.joystick?.vector || { x: 0, y: 0, magnitude: 0 };
	const magnitude = finite(joystick.magnitude);
	let forward;
	let strafe;
	if (typeof axis.forward === 'number' || typeof axis.strafe === 'number') {
		// Minimal-meadow axes already resolve keyboard direction.
		forward = finite(axis.forward) + finite(axis.joystickForward);
		strafe = finite(axis.strafe) + finite(axis.joystickStrafe);
	} else {
		// Canonical x is strafe-right and y is backward-positive.
		// The server accepts forward-positive and strafe-right-positive.
		forward = -(finite(axis.y) + finite(joystick.y) * magnitude);
		strafe = finite(axis.x) + finite(joystick.x) * magnitude;
	}
	const length = Math.hypot(forward, strafe);
	if (length > 1) {
		forward /= length;
		strafe /= length;
	}
	return {
		forward: finite(forward),
		strafe: finite(strafe)
	};
}

/** Disallows NaN/Infinity and represents resting movement with positive zero. */
function finite(value) {
	const number = Number(value);
	return Number.isFinite(number) && number !== 0 ? number : 0;
}
