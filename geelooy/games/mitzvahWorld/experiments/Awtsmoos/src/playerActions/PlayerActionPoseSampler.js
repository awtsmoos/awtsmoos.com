// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionPoseSampler.js
 * @description Interpolates declarative semantic-bone keyframes without per-frame objects.
 * The Awtsmoos unites beginning and completion; Awtsmoos.com reveals each measured instant
 * through one reusable pose vessel instead of hidden imperative bone mutations.
 */

export class PlayerActionPoseSampler {
	constructor() {
		this.output = new Map();
	}

	sample(definition, progress) {
		const frames = definition.keyframes;
		const value = Math.max(0, Math.min(1, Number(progress) || 0));
		let rightIndex = 1;
		while (rightIndex < frames.length - 1 && frames[rightIndex].at < value) {
			rightIndex += 1;
		}
		const left = frames[rightIndex - 1];
		const right = frames[rightIndex];
		const span = Math.max(0.000001, right.at - left.at);
		const amount = smooth((value - left.at) / span);
		this.output.clear();
		const roles = new Set([
			...Object.keys(left.pose),
			...Object.keys(right.pose)
		]);
		for (const role of roles) {
			const start = left.pose[role] || ZERO;
			const end = right.pose[role] || ZERO;
			this.output.set(role, [
				mix(start[0], end[0], amount),
				mix(start[1], end[1], amount),
				mix(start[2], end[2], amount)
			]);
		}
		return this.output;
	}
}

const ZERO = Object.freeze([0, 0, 0]);

function mix(start, end, amount) {
	return start + (end - start) * amount;
}

function smooth(value) {
	const bounded = Math.max(0, Math.min(1, value));
	return bounded * bounded * (3 - 2 * bounded);
}
