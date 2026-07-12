// B"H
import { createRng } from '../../math/rng.js';
import { assemble, box, placed } from '../assembly.js';
import { modelPalette } from '../palettes.js';
import { storefrontSignMesh } from '../signs.js';
import { facadeMesh, steppedRoof } from './helpers.js';

/** A townhouse is walls, recessed windows, cornice, roof planes, and chimney. */
export function townhouseMesh(options = {}) {
	const seed = options.seed || 'townhouse';
	const random = createRng(seed);
	const colors = options.palette || modelPalette(seed);
	const width = 4.4 + random() * 1.4;
	const depth = 3.8 + random() * 1.3;
	const stories = 2 + Math.floor(random() * 3);
	const height = stories * (1.45 + random() * 0.25);
	return assemble(
		box([width, height, depth], [0, height / 2, 0], colors.body),
		facadeMesh({ width, height, depth, stories, columns: 3, colors }),
		gableRoof(width, depth, height, colors),
		box([0.45, 1.1, 0.5], [width * 0.27, height + 0.7, 0], colors.stone)
	);
}

/** A shop has glass, structural frames, striped awning, roof trim, and wall sign. */
export function shopMesh(options = {}) {
	const seed = options.seed || 'shop';
	const colors = options.palette || modelPalette(seed);
	const width = 6.2;
	const depth = 4.6;
	const height = 4.8;
	const front = depth / 2 + 0.04;
	const sign = storefrontSignMesh({ seed, palette: colors, width: width * 0.72, height: 0.72 });
	return assemble(
		box([width, height, depth], [0, height / 2, 0], colors.body),
		box([width * 0.82, height * 0.48, 0.1], [0, height * 0.32, front], colors.darkGlass),
		shopFrames(width, height, front, colors),
		awning(width, height, front, colors),
		placed(sign, { translate: [0, height * 0.79, front + 0.15] }),
		steppedRoof(width, depth, height + 0.08, colors, 2)
	);
}

function gableRoof(width, depth, height, colors) {
	return assemble(
		box([width * 0.62, 0.22, depth * 1.08], [-width * 0.22, height + width * 0.14, 0], colors.accent, [0, 0, -0.42]),
		box([width * 0.62, 0.22, depth * 1.08], [width * 0.22, height + width * 0.14, 0], colors.accent, [0, 0, 0.42])
	);
}

function shopFrames(width, height, front, colors) {
	return [-0.34, 0, 0.34].map(offset => box(
		[0.09, height * 0.5, 0.14],
		[width * offset, height * 0.32, front + 0.02],
		colors.metal
	));
}

function awning(width, height, front, colors) {
	return assemble(
		box([width * 0.95, 0.16, 1.1], [0, height * 0.61, front + 0.42], colors.accent, [0.16, 0, 0]),
		...[-0.38, -0.13, 0.13, 0.38].map(offset => box(
			[width * 0.04, 0.17, 1.12],
			[width * offset, height * 0.61, front + 0.43],
			colors.trim,
			[0.16, 0, 0]
		))
	);
}
