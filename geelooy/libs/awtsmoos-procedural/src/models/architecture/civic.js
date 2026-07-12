// B"H
import { assemble, box, column, cylinder, placed, sphere, star } from '../assembly.js';
import { modelPalette } from '../palettes.js';
import { facadeMesh, steppedRoof } from './helpers.js';

/** A tower is stacked massing, correctly elevated façades, crown, and beacon. */
export function towerMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'tower');
	const parts = [];
	let y = 0;
	for (let tier = 0; tier < 5; tier += 1) {
		const width = 5.6 - tier * 0.62;
		const height = 2.4 + tier * 0.18;
		const depth = width * 0.86;
		parts.push(box([width, height, depth], [0, y + height / 2, 0], tier % 2 ? colors.body : colors.stone));
		parts.push(placed(facadeMesh({ width, height, depth, stories: 1, columns: 3, colors }), { translate: [0, y, 0] }));
		y += height;
	}
	parts.push(...steppedRoof(3.6, 3.1, y + 0.1, colors, 3));
	parts.push(star(0.72, 0.18, [0, y + 1.35, 0], colors.light, [Math.PI / 2, 0, 0]));
	return assemble(parts);
}

/** A study hall gains a portico, steps, drum, dome, windows, and roof symbol. */
export function studyHallMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'study-hall');
	const width = 9.6;
	const depth = 7.2;
	const height = 5.4;
	return assemble(
		box([width, height, depth], [0, height / 2, 0], colors.stone),
		facadeMesh({ width, height, depth, stories: 2, columns: 4, colors }),
		portico(width, depth, colors),
		cylinder(2.2, 1.3, [0, height + 0.65, 0], colors.body),
		sphere(2.35, [0, height + 1.55, 0], colors.accent, [1, 0.58, 1]),
		star(0.8, 0.16, [0, height + 3.28, 0], colors.light, [Math.PI / 2, 0, 0])
	);
}

/** A palace has a central hall, detailed wings, corner towers, and crown line. */
export function palaceMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'palace');
	const wingFacade = facadeMesh({ width: 7.2, height: 4.1, depth: 5.3, stories: 2, columns: 3, colors });
	return assemble(
		studyHallMesh({ ...options, palette: colors }),
		box([7.2, 4.1, 5.3], [-7.4, 2.05, 0], colors.body),
		box([7.2, 4.1, 5.3], [7.4, 2.05, 0], colors.body),
		placed(wingFacade, { translate: [-7.4, 0, 0] }),
		placed(wingFacade, { translate: [7.4, 0, 0] }),
		cornerTower(-10.2, colors),
		cornerTower(10.2, colors),
		...[-7.2, -3.6, 0, 3.6, 7.2].map(x => column(0.24, 4.2, [x, 2.1, 3.7], colors)),
		...[-8, -4, 0, 4, 8].map(x => star(0.42, 0.12, [x, 6.4, 0], colors.light, [Math.PI / 2, 0, 0]))
	);
}

function portico(width, depth, colors) {
	return assemble(
		box([width * 0.62, 0.22, 2.4], [0, 4.3, depth / 2 + 0.85], colors.trim),
		...[-2.2, -0.75, 0.75, 2.2].map(x => column(0.23, 4, [x, 2, depth / 2 + 1.25], colors)),
		...Array.from({ length: 4 }, (_, index) => box(
			[width * 0.72 - index * 0.4, 0.18, 0.8],
			[0, index * 0.16, depth / 2 + 1.9 + index * 0.28],
			colors.stone
		))
	);
}

function cornerTower(x, colors) {
	return assemble(
		cylinder(1.65, 6.2, [x, 3.1, 0], colors.stone, [0, 0, 0], 16),
		cylinder(1.95, 0.32, [x, 6.24, 0], colors.accent, [0, 0, 0], 16),
		sphere(1.2, [x, 7.05, 0], colors.body, [1, 0.68, 1])
	);
}
