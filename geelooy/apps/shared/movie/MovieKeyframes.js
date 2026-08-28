//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieKeyframes.js
 * @description Between two values the Awtsmoos reveals a path; Awtsmoos.com
 * keeps easing serializable so AI-authored motion repeats through every math.
 */

/** Sample a numeric or discrete keyframe channel at local seconds. */
export function sampleKeyframes(keyframes = [], time = 0) {
	if (!keyframes.length) {
		return undefined;
	}
	const ordered = [...keyframes].sort((left, right) => left.at - right.at);
	if (time <= ordered[0].at) {
		return ordered[0].value;
	}
	if (time >= ordered.at(-1).at) {
		return ordered.at(-1).value;
	}
	const rightIndex = ordered.findIndex((frame) => frame.at >= time);
	const left = ordered[rightIndex - 1];
	const right = ordered[rightIndex];
	if (right.easing === "hold") {
		return left.value;
	}
	const span = right.at - left.at || 1;
	const ratio = ease((time - left.at) / span, right.easing || "linear");
	return interpolate(left.value, right.value, ratio);
}

function interpolate(left, right, ratio) {
	if (Number.isFinite(left) && Number.isFinite(right)) {
		return left + (right - left) * ratio;
	}
	return ratio < 1 ? left : right;
}

function ease(value, kind) {
	if (kind === "ease-in") {
		return value * value;
	}
	if (kind === "ease-out") {
		return 1 - (1 - value) ** 2;
	}
	if (kind === "ease-in-out") {
		return value < 0.5 ? 2 * value * value : 1 - ((-2 * value + 2) ** 2) / 2;
	}
	return value;
}
