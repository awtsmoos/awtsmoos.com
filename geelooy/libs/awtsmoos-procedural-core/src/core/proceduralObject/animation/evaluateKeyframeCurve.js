// B"H
// Boruch Hashem
// Blessed is He
/** Between anchored moments, interpolation reveals the finite path of change. */

import { createKeyframe } from "./createKeyframe.js";

function mix(left, right, amount) {
	if (Array.isArray(left)) return left.map((value, index) => value + (right[index] - value) * amount);
	return left + (right - left) * amount;
}

function cubic(a, b, c, d, t) {
	const inverse = 1 - t;
	return a * inverse ** 3 + 3 * b * inverse ** 2 * t + 3 * c * inverse * t ** 2 + d * t ** 3;
}

function cubicValue(a, b, c, d, t) {
	if (Array.isArray(a)) return a.map((value, index) => cubic(value, b[index], c[index], d[index], t));
	return cubic(a, b, c, d, t);
}

function solveBezierTime(left, right, time) {
	let low = 0;
	let high = 1;
	for (let iteration = 0; iteration < 24; iteration += 1) {
		const middle = (low + high) * 0.5;
		const sampled = cubic(left.time, left.handleRight.time, right.handleLeft.time, right.time, middle);
		if (sampled < time) low = middle; else high = middle;
	}
	return (low + high) * 0.5;
}

export function evaluateKeyframeCurve(keyframes, time) {
	const frames = keyframes.map(createKeyframe).sort((left, right) => left.time - right.time);
	if (!frames.length) throw new Error("Keyframe curve requires at least one keyframe.");
	if (time <= frames[0].time) return frames[0].value;
	if (time >= frames.at(-1).time) return frames.at(-1).value;
	let rightIndex = 1;
	while (frames[rightIndex].time < time) rightIndex += 1;
	const left = frames[rightIndex - 1];
	const right = frames[rightIndex];
	if (left.interpolation === "constant") return left.value;
	if (left.interpolation === "linear") return mix(left.value, right.value, (time - left.time) / (right.time - left.time));
	const parameter = solveBezierTime(left, right, time);
	return cubicValue(left.value, left.handleRight.value, right.handleLeft.value, right.value, parameter);
}
