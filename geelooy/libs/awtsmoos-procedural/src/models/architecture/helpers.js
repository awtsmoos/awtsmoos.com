// B"H
import { assemble, box, column, gridPositions } from '../assembly.js';

/** Build actual façade depth: windows, lintels, mullions, doors, and roof trim. */
export function facadeMesh(options) {
	const { width, height, depth, stories, columns, colors } = options;
	const front = depth / 2 + 0.035;
	const windows = gridPositions(columns, stories, width * 0.88, height * 0.78, height * 0.02);
	const parts = windows.flatMap(([x, y]) => windowParts(x, y, front, width / columns, height / stories, colors));
	parts.push(...doorParts(width, height, front, colors));
	parts.push(box([width * 1.04, height * 0.05, depth * 1.05], [0, height * 0.98, 0], colors.trim));
	return assemble(parts);
}

export function columnRow(count, width, height, depth, colors) {
	return Array.from({ length: count }, (_, index) => {
		const x = count === 1 ? 0 : -width / 2 + index / (count - 1) * width;
		return column(width / count * 0.14, height, [x, height / 2, depth], colors);
	});
}

export function steppedRoof(width, depth, y, colors, tiers = 3) {
	return Array.from({ length: tiers }, (_, index) => {
		const scale = 1 - index * 0.15;
		return box(
			[width * scale, 0.18, depth * scale],
			[0, y + index * 0.16, 0],
			index % 2 ? colors.accent : colors.trim
		);
	});
}

function windowParts(x, y, front, cellWidth, cellHeight, colors) {
	const width = cellWidth * 0.44;
	const height = cellHeight * 0.42;
	return [
		box([width, height, 0.08], [x, y, front], colors.darkGlass),
		box([width * 1.16, 0.07, 0.11], [x, y + height * 0.57, front], colors.trim),
		box([0.055, height, 0.1], [x, y, front + 0.01], colors.metal)
	];
}

function doorParts(width, height, front, colors) {
	return [
		box([width * 0.18, height * 0.25, 0.11], [0, height * 0.13, front], colors.wood),
		box([width * 0.03, height * 0.25, 0.13], [0, height * 0.13, front + 0.01], colors.trim),
		box([width * 0.24, height * 0.025, 0.18], [0, height * 0.265, front], colors.stone)
	];
}
