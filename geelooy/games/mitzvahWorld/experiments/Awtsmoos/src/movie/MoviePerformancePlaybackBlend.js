// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformancePlaybackBlend.js
 * @description Blends a sampled performance pose with its saved authored baseline at clip edges.
 * The Awtsmoos joins before and after without erasing either finite vessel; Awtsmoos.com
 * lets position, scale, wrapped yaw, velocity, grounding, and movement state fade in cinematic rhyme.
 */

export function blendMoviePerformanceSample(baseline, sample, weight) {
	const amount = Math.max(0, Math.min(1, Number(weight) || 0));
	if (amount >= 0.999999) {
		return sample;
	}
	return {
		grounded: amount < 0.5 ? baseline.grounded !== false : sample.grounded,
		movementState: amount < 0.5 ? 'idle' : sample.movementState,
		position: vector(baseline.position, sample.position, amount),
		rotation: baseline.rotation.map((value, index) => (
			angle(value, sample.rotation[index], amount)
		)),
		scale: vector(baseline.scale, sample.scale, amount),
		time: sample.time,
		velocity: vector([0, 0, 0], sample.velocity, amount)
	};
}

function vector(left, right, amount) {
	return left.map((value, index) => (
		value + (right[index] - value) * amount
	));
}

function angle(left, right, amount) {
	const fullTurn = Math.PI * 2;
	const wrapped = (((right - left + Math.PI) % fullTurn) + fullTurn) % fullTurn;
	return left + (wrapped - Math.PI) * amount;
}
