// B"H
import { assemble, box, placed } from '../assembly.js';
import { modelPalette } from '../palettes.js';
import { storefrontSignMesh } from '../signs.js';
import { vehicleBody, wheelSet, windowBand } from './helpers.js';

export function carMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'car');
	return vehicleBody({ width: 2.1, length: 4.5, height: 1.5, colors });
}

export function taxiMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'taxi');
	colors.body = [0.94, 0.68, 0.08, 1];
	return assemble(
		vehicleBody({ width: 2.1, length: 4.6, height: 1.5, colors }),
		box([0.78, 0.24, 0.38], [0, 1.65, 0.08], colors.light)
	);
}

export function vanMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'van');
	return assemble(
		vehicleBody({ width: 2.35, length: 5.2, height: 2.2, colors, cabin: 0.7, hood: 0.18 }),
		...windowBand(2.35, 0.48, 5.2, 1.48, colors, 3)
	);
}

export function busMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'bus');
	const width = 2.75;
	const length = 8.4;
	const height = 3.15;
	return assemble(
		box([width, height, length], [0, height / 2, 0], colors.body),
		...windowBand(width, 0.82, length, height * 0.7, colors, 7),
		...wheelSet(width, length, 1.6, colors, 3),
		box([width * 0.78, 0.72, 0.08], [0, height * 0.7, -length * 0.505], colors.glass),
		box([width * 0.44, height * 0.55, 0.08], [width * 0.18, height * 0.38, -length * 0.51], colors.darkGlass),
		box([width * 0.76, 0.2, 0.12], [0, 0.32, -length * 0.515], colors.metal)
	);
}

export function truckMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'truck');
	return assemble(
		vehicleBody({ width: 2.6, length: 3.6, height: 2.25, colors, cabin: 0.58, hood: 0.12 }),
		box([2.9, 2.9, 5.2], [0, 1.75, 3.25], colors.accent),
		box([2.56, 2.35, 0.1], [0, 1.72, 5.87], colors.metal),
		...wheelSet(2.8, 6.5, 1.8, colors, 3)
	);
}

export function marketCartMesh(options = {}) {
	const seed = options.seed || 'market-cart';
	const colors = options.palette || modelPalette(seed);
	const sign = storefrontSignMesh({ seed, palette: colors, width: 2.2, height: 0.54, lamps: false });
	return assemble(
		box([2.6, 1.15, 3.4], [0, 0.92, 0], colors.wood),
		...wheelSet(2.6, 3.4, 1.6, colors, 2),
		box([3.1, 0.18, 3.9], [0, 2.45, 0], colors.accent),
		...[-1, 1].flatMap(x => [-1, 1].map(z => box([0.1, 2.5, 0.1], [x * 1.2, 1.35, z * 1.45], colors.metal))),
		placed(sign, { translate: [0, 1.72, 1.86] })
	);
}
