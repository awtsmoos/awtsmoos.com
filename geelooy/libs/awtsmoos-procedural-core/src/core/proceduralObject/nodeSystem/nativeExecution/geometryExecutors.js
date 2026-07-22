// B"H
// Boruch Hashem
// Blessed is He
/** Geometry reference execution yields typed arrays for core primitives. */

function artifact(positions, indices, metadata = {}) {
	return Object.freeze({
		schema: "awtsmoos.reference-geometry",
		positions: new Float32Array(positions),
		indices: new Uint32Array(indices),
		metadata: Object.freeze(metadata)
	});
}

export function executeCube(inputs = {}) {
	const size = Array.from(inputs.size ?? [1, 1, 1]);
	const half = size.map((value) => Number(value) * 0.5);
	const positions = [
		-half[0], -half[1], -half[2], half[0], -half[1], -half[2],
		half[0], half[1], -half[2], -half[0], half[1], -half[2],
		-half[0], -half[1], half[2], half[0], -half[1], half[2],
		half[0], half[1], half[2], -half[0], half[1], half[2]
	];
	const indices = [
		0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6,
		0, 4, 5, 0, 5, 1, 3, 2, 6, 3, 6, 7,
		0, 3, 7, 0, 7, 4, 1, 5, 6, 1, 6, 2
	];
	return Object.freeze({ mesh: artifact(positions, indices, { primitive: "cube" }) });
}

export function executeGrid(inputs = {}) {
	const countX = Math.max(2, Math.floor(inputs["vertices-x"] ?? 3));
	const countY = Math.max(2, Math.floor(inputs["vertices-y"] ?? 3));
	const sizeX = Number(inputs["size-x"] ?? 1);
	const sizeY = Number(inputs["size-y"] ?? 1);
	const positions = [];
	const indices = [];
	for (let y = 0; y < countY; y += 1) {
		for (let x = 0; x < countX; x += 1) {
			positions.push((x / (countX - 1) - 0.5) * sizeX, 0, (y / (countY - 1) - 0.5) * sizeY);
		}
	}
	for (let y = 0; y < countY - 1; y += 1) {
		for (let x = 0; x < countX - 1; x += 1) {
			const a = y * countX + x;
			const b = a + 1;
			const c = a + countX;
			const d = c + 1;
			indices.push(a, c, b, b, c, d);
		}
	}
	return Object.freeze({ mesh: artifact(positions, indices, { primitive: "grid" }) });
}

export function executeTransformGeometry(inputs = {}) {
	const geometry = inputs.geometry;
	if (!geometry?.positions) {
		throw new TypeError("Transform Geometry requires a reference geometry artifact.");
	}
	const translation = Array.from(inputs.translation ?? [0, 0, 0]);
	const scale = Array.from(inputs.scale ?? [1, 1, 1]);
	const positions = Array.from(geometry.positions, (value, index) => (
		value * Number(scale[index % 3] ?? 1) + Number(translation[index % 3] ?? 0)
	));
	return Object.freeze({
		geometry: artifact(positions, geometry.indices, {
			...geometry.metadata,
			transformed: true
		})
	});
}
