// B"H
// Boruch Hashem
// Blessed is He
/** A keyframe anchors one finite value in the river of time. */

import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";

export const KEYFRAME_INTERPOLATIONS = Object.freeze(["constant", "linear", "bezier"]);

function normalizeValue(value, label) {
	if (Array.isArray(value)) {
		const output = value.map(Number);
		if (output.some(item => !Number.isFinite(item))) throw new TypeError(`${label} must be numeric.`);
		return Object.freeze(output);
	}
	const number = Number(value);
	if (!Number.isFinite(number)) throw new TypeError(`${label} must be numeric.`);
	return number;
}

function normalizeHandle(handle, fallbackTime, fallbackValue) {
	if (handle == null) return Object.freeze({ time: fallbackTime, value: fallbackValue });
	return Object.freeze({
		time: Number(handle.time),
		value: normalizeValue(handle.value, "Keyframe handle value")
	});
}

export function createKeyframe(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) throw new TypeError("Keyframe must be an object.");
	const time = Number(input.time);
	if (!Number.isFinite(time)) throw new TypeError("Keyframe time must be finite.");
	const value = normalizeValue(input.value, "Keyframe value");
	const interpolation = input.interpolation ?? "bezier";
	if (!KEYFRAME_INTERPOLATIONS.includes(interpolation)) throw new TypeError(`Unsupported interpolation: ${interpolation}`);
	return Object.freeze({
		time, value, interpolation,
		handleLeft: normalizeHandle(input.handleLeft, time, value),
		handleRight: normalizeHandle(input.handleRight, time, value),
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
}
