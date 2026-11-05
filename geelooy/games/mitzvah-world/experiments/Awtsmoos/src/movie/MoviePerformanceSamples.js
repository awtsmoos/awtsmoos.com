// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceSamples.js
 * @description Creates meaningful intent and resulting-state samples without keydown noise.
 * The Awtsmoos joins desire and accomplished motion in one present frame; Awtsmoos.com
 * records velocity, grounding, animation, and transform so cinematic truth may replay in rhyme.
 */

export function normalizeMoviePerformanceIntent(source = {}) {
	const forward = clamp(source.forward);
	const strafe = clamp(source.strafe);
	const length = Math.hypot(forward, strafe);
	const divisor = Math.max(1, length);
	return Object.freeze({
		crouch: Boolean(source.crouch),
		forward: forward / divisor,
		jump: Boolean(source.jump),
		run: Boolean(source.run),
		strafe: strafe / divisor,
		turn: clamp(source.turn)
	});
}

export function createMoviePerformanceSample(target, time, previous = null) {
	const transform = target.transformSnapshot();
	const delta = Math.max(0.0001, Number(time) - Number(previous?.time || time));
	const velocity = previous
		? transform.position.map((value, index) => (
			(value - previous.position[index]) / delta
		))
		: [0, 0, 0];
	return {
		grounded: target.grounded(),
		movementState: target.movementState(),
		position: [...transform.position],
		rotation: [...transform.rotation],
		scale: [...transform.scale],
		time: Math.max(0, Number(time) || 0),
		velocity
	};
}

export function moviePerformanceSampleChanged(left, right, tolerances = {}) {
	if (!left || !right) return true;
	if (left.grounded !== right.grounded || left.movementState !== right.movementState) return true;
	return vectorDistance(left.position, right.position) > (tolerances.position ?? 0.002)
		|| vectorDistance(left.rotation, right.rotation) > (tolerances.rotation ?? 0.002)
		|| vectorDistance(left.scale, right.scale) > (tolerances.scale ?? 0.001);
}

export function vectorDistance(left = [], right = []) {
	return Math.hypot(...[0, 1, 2].map(index => (
		Number(left[index] || 0) - Number(right[index] || 0)
	)));
}

function clamp(value) {
	return Math.max(-1, Math.min(1, Number(value) || 0));
}
