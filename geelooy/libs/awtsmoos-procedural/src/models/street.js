// B"H
import { assemble, box, cylinder, placed, ring, sphere } from './assembly.js';
import { modelPalette } from './palettes.js';
import { storefrontSignMesh, streetSignMesh } from './signs.js';

export function benchMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'bench');
	return assemble(
		...[-0.45, 0, 0.45].map(z => box([3.2, 0.12, 0.28], [0, 0.9 + z * 0.6, z], colors.wood, [z > 0 ? -0.18 : 0, 0, 0])),
		...[-1, 1].flatMap(x => [0, 0.55].map(z => box([0.18, 1, 0.18], [x * 1.2, 0.5, z], colors.metal))),
		box([3.35, 0.14, 0.2], [0, 1.35, 0.48], colors.wood)
	);
}

export function streetLampMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'lamp');
	return assemble(
		cylinder(0.16, 5.2, [0, 2.6, 0], colors.metal, [0, 0, 0], 12),
		cylinder(0.48, 0.18, [0, 0.09, 0], colors.stone, [0, 0, 0], 12),
		box([1.1, 0.12, 0.12], [0.48, 5.05, 0], colors.metal, [0, 0, -0.18]),
		box([0.72, 0.18, 0.62], [0.93, 4.78, 0], colors.dark),
		sphere(0.31, [0.93, 4.72, 0], colors.light, [1, 0.76, 1])
	);
}

export function kioskMesh(options = {}) {
	const seed = options.seed || 'kiosk';
	const colors = options.palette || modelPalette(seed);
	const sign = storefrontSignMesh({ seed, palette: colors, width: 3.0, height: 0.62 });
	return assemble(
		box([3.8, 3.1, 3.2], [0, 1.55, 0], colors.body),
		box([2.8, 1.25, 0.12], [0, 1.75, 1.64], colors.darkGlass),
		box([4.4, 0.24, 3.8], [0, 3.22, 0], colors.accent),
		...[-1, 1].map(x => box([0.18, 3.0, 0.18], [x * 1.7, 1.5, 1.5], colors.trim)),
		placed(sign, { translate: [0, 2.75, 1.8] })
	);
}

export function fountainMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'fountain');
	return assemble(
		cylinder(2.8, 0.55, [0, 0.28, 0], colors.stone, [0, 0, 0], 24),
		ring(2.5, 1.85, [0, 0.58, 0], colors.glass),
		cylinder(0.42, 2.4, [0, 1.5, 0], colors.stone, [0, 0, 0], 16),
		cylinder(1.35, 0.3, [0, 2.42, 0], colors.stone, [0, 0, 0], 20),
		sphere(0.48, [0, 2.88, 0], colors.light),
		...Array.from({ length: 8 }, (_, index) => sphere(
			0.18,
			[Math.cos(index / 8 * Math.PI * 2) * 1.6, 1.1, Math.sin(index / 8 * Math.PI * 2) * 1.6],
			colors.glass,
			[0.72, 1.8, 0.72]
		))
	);
}

export function streetSignModel(options = {}) {
	return streetSignMesh(options);
}

export function bollardMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'bollard');
	return assemble(
		cylinder(0.25, 1.25, [0, 0.63, 0], colors.metal, [0, 0, 0], 12),
		cylinder(0.34, 0.12, [0, 1.24, 0], colors.accent, [0, 0, 0], 12),
		cylinder(0.42, 0.12, [0, 0.06, 0], colors.stone, [0, 0, 0], 12)
	);
}
