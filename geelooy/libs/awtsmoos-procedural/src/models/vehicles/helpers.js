// B"H
import { assemble, box, wheel } from '../assembly.js';

/** Assemble a complete road vehicle with body, cabin, glass, lights, and wheels. */
export function vehicleBody(options) {
	const { width, length, height, colors, cabin = 0.52, hood = 0.28 } = options;
	const baseY = height * 0.27;
	return assemble(
		box([width, height * 0.46, length], [0, baseY, 0], colors.body),
		box([width * 0.84, height * 0.52, length * cabin], [0, height * 0.7, length * 0.04], colors.body),
		glassCabin(width, length, height, colors, cabin),
		box([width * 0.94, height * 0.12, length * hood], [0, height * 0.48, -length * 0.35], colors.accent),
		wheelSet(width, length, height, colors),
		lightSet(width, length, height, colors),
		box([width * 0.96, height * 0.08, 0.12], [0, height * 0.18, -length * 0.51], colors.metal),
		box([width * 0.96, height * 0.08, 0.12], [0, height * 0.18, length * 0.51], colors.metal)
	);
}

export function wheelSet(width, length, height, colors, pairs = 2) {
	const parts = [];
	for (let pair = 0; pair < pairs; pair += 1) {
		const z = pairs === 1 ? 0 : -length * 0.33 + pair / (pairs - 1) * length * 0.66;
		for (const side of [-1, 1]) parts.push(wheel(height * 0.24, width * 0.12, [side * width * 0.52, height * 0.22, z], colors));
	}
	return parts;
}

export function windowBand(width, height, length, y, colors, count = 5) {
	const parts = [];
	for (let index = 0; index < count; index += 1) {
		const z = -length * 0.36 + index / Math.max(1, count - 1) * length * 0.72;
		for (const side of [-1, 1]) parts.push(box([0.08, height, length / count * 0.62], [side * width * 0.505, y, z], colors.darkGlass));
	}
	return parts;
}

function glassCabin(width, length, height, colors, cabin) {
	return [
		box([width * 0.68, height * 0.3, 0.07], [0, height * 0.78, -length * cabin * 0.27], colors.glass, [-0.18, 0, 0]),
		box([width * 0.68, height * 0.3, 0.07], [0, height * 0.78, length * cabin * 0.33], colors.darkGlass, [0.18, 0, 0]),
		box([0.07, height * 0.3, length * cabin * 0.56], [-width * 0.43, height * 0.78, length * 0.03], colors.glass),
		box([0.07, height * 0.3, length * cabin * 0.56], [width * 0.43, height * 0.78, length * 0.03], colors.glass)
	];
}

function lightSet(width, length, height, colors) {
	return [
		...[-1, 1].map(side => box([width * 0.18, height * 0.13, 0.08], [side * width * 0.31, height * 0.34, -length * 0.515], colors.light)),
		...[-1, 1].map(side => box([width * 0.16, height * 0.12, 0.08], [side * width * 0.32, height * 0.34, length * 0.515], colors.red))
	];
}
