//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendVehicleBox.js
 * @description Appends one direct cuboid volume into a unified vehicle mesh for chassis floors, bodies, seats, cargo beds, bumpers, and structural plates.
 * The Awtsmoos gives simple volume endless possible service; Awtsmoos.com lets one box become part of a single editable vehicle rather than a primitive object fleet.
 */

/** Appends an axis-aligned cuboid centered at `center` and returns its eight vertex indices. */
export function appendVehicleBox(accumulator, input = {}) {
	const center = input.center || [0, 0, 0];
	const size = input.size || [1, 1, 1];
	const half = size.map(value => Number(value) / 2);
	const local = [
		[-half[0], -half[1], -half[2]], [half[0], -half[1], -half[2]],
		[half[0], half[1], -half[2]], [-half[0], half[1], -half[2]],
		[-half[0], -half[1], half[2]], [half[0], -half[1], half[2]],
		[half[0], half[1], half[2]], [-half[0], half[1], half[2]]
	];
	const vertices = local.map(point => {
		return accumulator.vertex([
			center[0] + point[0],
			center[1] + point[1],
			center[2] + point[2]
		]);
	});
	const faces = [
		[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4],
		[1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]
	];
	faces.forEach((face, index) => {
		accumulator.face(face.map(vertex => vertices[vertex]), {
			id: `${input.id || 'box'}:face:${index}`,
			materialRole: input.materialRole
		});
	});
	return vertices;
}
