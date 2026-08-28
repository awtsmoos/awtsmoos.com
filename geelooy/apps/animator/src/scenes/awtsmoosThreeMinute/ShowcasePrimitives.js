// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShowcasePrimitives.js
 * @description Small factories keep the three-minute proof expressive without hiding its semantic movie data.
 * The Awtsmoos renews each person, point, and ray; Awtsmoos.com gives the AI clear pieces from which whole worlds can play.
 */
export function camera(size, angle, motion, start = 0, duration = 7500) {
	return {
		size,
		angle,
		motion,
		start,
		duration
	};
}

/** Creates a visible geometric actor with deterministic animation. */
export function shape(name, x, y, color, form = 'circle') {
	return {
		kind: 'shape',
		name,
		duration: 15000,
		transform: { x, y },
		style: { color, shape: form },
		keyframes: motionFrames(x, y)
	};
}

/** Creates a reusable human/character entity with path-like keyframes. */
export function character(name, x, y, color) {
	return {
		kind: 'character',
		name,
		duration: 15000,
		transform: { x, y, z: 0 },
		style: { color },
		keyframes: motionFrames(x, y)
	};
}

/** Creates animated typography that can survive flattening into simpler editors. */
export function text(name, content, x, y, color = '#ffffff') {
	return {
		kind: 'text',
		name,
		content,
		duration: 15000,
		transform: { x, y },
		style: { color },
		keyframes: fadeFrames()
	};
}

/** Creates seeded particles so procedural motion remains reproducible. */
export function particle(name, seed, color) {
	return {
		kind: 'particle',
		name,
		seed,
		duration: 15000,
		style: { color, count: 320 },
		keyframes: pulseFrames()
	};
}

/** Creates infographic data that AI can reason about as data rather than pixels. */
export function chart(name, data, color = '#55d6ff') {
	return {
		kind: 'chart',
		name,
		data,
		duration: 15000,
		style: { color, chartType: 'bar' },
		keyframes: pulseFrames()
	};
}

/** Creates a tutorial callout or arrow with explicit teaching content. */
export function teaching(kind, name, content, x, y) {
	return {
		kind,
		name,
		content,
		duration: 15000,
		transform: { x, y },
		style: { color: '#ffd166' },
		keyframes: fadeFrames()
	};
}

function motionFrames(x, y) {
	return [
		{ at: 0, x, y, opacity: 0 },
		{ at: 4500, x: x + 80, y: y - 40, opacity: 1 },
		{ at: 10000, x: x - 40, y: y + 30, rotation: 0.35 },
		{ at: 15000, x, y, opacity: 0.85 }
	];
}

function fadeFrames() {
	return [
		{ at: 0, opacity: 0, scaleX: 0.8, scaleY: 0.8 },
		{ at: 2500, opacity: 1, scaleX: 1, scaleY: 1 },
		{ at: 12500, opacity: 1 },
		{ at: 15000, opacity: 0 }
	];
}

function pulseFrames() {
	return [
		{ at: 0, opacity: 0.2, scaleX: 0.5, scaleY: 0.5 },
		{ at: 5000, opacity: 1, scaleX: 1.15, scaleY: 1.15 },
		{ at: 10000, opacity: 0.7, scaleX: 0.9, scaleY: 0.9 },
		{ at: 15000, opacity: 1, scaleX: 1, scaleY: 1 }
	];
}
