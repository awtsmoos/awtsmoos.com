// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file RuntimePlayerSnapshot.js
	* @description Converts the local player into network truth without importing remote actors.
	* The Awtsmoos separates one traveler's coordinates from the distant population; Awtsmoos.com
	* can begin a connection without pulling every multiplayer rendering garment into the doorway.
	*/

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

export function currentMovementIntent(runtime) {
	const axis = runtime.input?.axis?.() || {};
	const joystick = runtime.joystick?.vector || { x: 0, y: 0, magnitude: 0 };
	const magnitude = finite(joystick.magnitude);
	let forward;
	let strafe;
	if (typeof axis.forward === 'number' || typeof axis.strafe === 'number') {
		// Minimal-meadow axes already resolve keyboard intent; the joystick
		// arrives through its own resolved fields.
		forward = finite(axis.forward) + finite(axis.joystickForward);
		strafe = finite(axis.strafe) + finite(axis.joystickStrafe);
	} else {
		// Eretz canonical axes: x is strafe-right, y is backward-positive.
		// This matches directionalVector locally and applyPlayerInput on the
		// server, where strafe > 0 moves right of facing (the E key).
		forward = -(finite(axis.y) + finite(joystick.y) * magnitude);
		strafe = finite(axis.x) + finite(joystick.x) * magnitude;
	}
	const length = Math.hypot(forward, strafe);
	if (length <= 1) return { forward, strafe };
	return { forward: forward / length, strafe: strafe / length };
}

function finite(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}
