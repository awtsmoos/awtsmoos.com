// B"H
import { createRng } from '../math/rng.js';

const BASES = [
	[[0.68, 0.26, 0.18, 1], [0.96, 0.72, 0.28, 1]],
	[[0.18, 0.42, 0.62, 1], [0.22, 0.78, 0.82, 1]],
	[[0.38, 0.22, 0.58, 1], [0.92, 0.42, 0.76, 1]],
	[[0.22, 0.54, 0.32, 1], [0.72, 0.88, 0.34, 1]],
	[[0.62, 0.54, 0.42, 1], [0.92, 0.84, 0.62, 1]]
];

/** Deterministic materials keep every model varied yet replayable. */
export function modelPalette(seed = 'model') {
	const random = createRng(seed);
	const base = BASES[Math.floor(random() * BASES.length)];
	return {
		body: vary(base[0], random, 0.13),
		accent: vary(base[1], random, 0.1),
		trim: [0.92, 0.82, 0.62, 1],
		stone: [0.56, 0.54, 0.52, 1],
		glass: [0.12, 0.48, 0.68, 0.88],
		darkGlass: [0.045, 0.16, 0.24, 0.94],
		metal: [0.58, 0.64, 0.7, 1],
		dark: [0.045, 0.04, 0.055, 1],
		tire: [0.022, 0.024, 0.03, 1],
		light: [1, 0.9, 0.42, 1],
		red: [0.92, 0.08, 0.055, 1],
		green: [0.12, 0.48, 0.22, 1],
		wood: [0.42, 0.2, 0.08, 1],
		white: [0.94, 0.94, 0.9, 1]
	};
}

function vary(color, random, amount) {
	const shift = (random() - 0.5) * amount * 2;
	return color.map((channel, index) => index === 3 ? channel : clamp(channel + shift));
}

function clamp(value) {
	return Math.max(0.02, Math.min(1, value));
}
