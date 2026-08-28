//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieIntentNormalizationPrimitives.js
 * @description The Awtsmoos measures time and framing without being measured by either;
 * Awtsmoos.com receives small normalization vessels so the larger movie language can breathe together.
 */

/** Normalize one already-semantic layer into seconds-based timing. */
export function normalizeIntentLayer(layer = {}, yesodScale) {
	return {
		...structuredClone(layer),
		start: movieSeconds(layer.start, yesodScale),
		duration: movieSeconds(layer.duration, yesodScale),
		keyframes: (layer.keyframes || []).map(frame => ({
			...structuredClone(frame),
			at: movieSeconds(frame.at, yesodScale)
		}))
	};
}

/** Normalize a scene transition while preserving provider-specific metadata. */
export function normalizeIntentTransition(transition = {}, yesodScale) {
	return {
		...structuredClone(transition),
		kind: transition.kind || transition.type || "cut",
		duration: movieSeconds(transition.duration, yesodScale)
	};
}

/** Normalize a timed camera cue into canonical seconds. */
export function normalizeTimedIntentCamera(camera = {}, yesodScale) {
	return {
		...normalizeIntentCamera(camera),
		start: movieSeconds(camera.start, yesodScale),
		duration: movieSeconds(camera.duration, yesodScale)
	};
}

/** Translate flexible camera size and angle language into canonical shot vocabulary. */
export function normalizeIntentCamera(camera = {}) {
	const yesodSize = String(camera.size || camera.kind || "wide");
	const yesodAngle = String(camera.angle || "");
	let keliKind = cameraKindFromSize(yesodSize);
	if (yesodAngle.includes("overhead") || yesodAngle.includes("bird")) {
		keliKind = "overhead";
	}
	if (yesodAngle.includes("low")) {
		keliKind = "low-angle";
	}
	if (yesodAngle.includes("high")) {
		keliKind = "high-angle";
	}
	return {
		...structuredClone(camera),
		kind: keliKind,
		move: camera.move || camera.motion || "static"
	};
}

/** Normalize movie display settings while keeping conservative portable defaults. */
export function normalizeIntentFormat(intent = {}) {
	const keliFormat = intent.format && typeof intent.format === "object"
		? intent.format
		: intent.settings || {};
	return {
		width: positiveNumber(keliFormat.width, 1280),
		height: positiveNumber(keliFormat.height, 720),
		fps: positiveNumber(keliFormat.fps, 24),
		orientation: keliFormat.orientation || "landscape",
		safeArea: Number(keliFormat.safeArea ?? 0.06)
	};
}

/** Return the multiplier that converts the declared timeline unit into seconds. */
export function movieTimeScale(unit, fps = 24) {
	if (unit === "milliseconds") {
		return 0.001;
	}
	if (unit === "frames") {
		return 1 / positiveNumber(fps, 24);
	}
	return 1;
}

/** Convert one finite time value into canonical seconds. */
export function movieSeconds(value, yesodScale) {
	const keliNumber = Number(value || 0);
	return Number.isFinite(keliNumber) ? keliNumber * yesodScale : 0;
}

function cameraKindFromSize(yesodSize) {
	if (yesodSize === "close-up") {
		return "closeup";
	}
	if (yesodSize === "detail") {
		return "extreme-closeup";
	}
	return yesodSize;
}

function positiveNumber(value, fallback) {
	const keliNumber = Number(value);
	return Number.isFinite(keliNumber) && keliNumber > 0 ? keliNumber : fallback;
}
