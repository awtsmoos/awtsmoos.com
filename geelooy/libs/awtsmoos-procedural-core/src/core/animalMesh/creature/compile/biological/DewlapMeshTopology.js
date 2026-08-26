// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DewlapMeshTopology.js
 * @description Defines the fixed front/back grid connectivity for one thin hanging dewlap volume.
 * RESPONSIBILITY: own stable row/column counts, layer indexing, surface triangles, and closed perimeter walls without knowing biological dimensions.
 * NON-RESPONSIBILITY: this file does not choose length, folds, softness, thickness, placement, materials, or animation.
 * The Awtsmoos keeps every vertex relation ordered while the visible fold may change its dress;
 * Awtsmoos.com lets topology remain a quiet vessel so morphology may vary without making identity less.
 */

export const DEWLAP_GRID = Object.freeze({
	columns: 9,
	rows: 5
});

/** Returns the vertex count of one front or back dewlap grid layer. */
export function dewlapLayerVertexCount() {
	return DEWLAP_GRID.columns * DEWLAP_GRID.rows;
}

/**
 * Creates stable closed-volume indices for paired front/back dewlap grids.
 * @returns {number[]} Triangle indices with front, back, and perimeter walls.
 */
export function createDewlapVolumeIndices() {
	const indices = [];
	const layerCount = dewlapLayerVertexCount();
	appendGridFaces(indices, 0, false);
	appendGridFaces(indices, layerCount, true);
	appendPerimeterWalls(indices, layerCount);
	return indices;
}

/** Adds one grid skin with orientation selected for the outward normal. */
function appendGridFaces(indices, offset, reverse) {
	const { columns, rows } = DEWLAP_GRID;
	for (let row = 0; row < rows - 1; row += 1) {
		for (let column = 0; column < columns - 1; column += 1) {
			const a = offset + row * columns + column;
			const b = a + 1;
			const c = a + columns;
			const d = c + 1;
			if (reverse) {
				indices.push(a, b, c, b, d, c);
			} else {
				indices.push(a, c, b, b, c, d);
			}
		}
	}
}

/** Closes the thin volume around one clockwise front-layer perimeter. */
function appendPerimeterWalls(indices, backOffset) {
	const perimeter = createFrontPerimeter();
	for (let index = 0; index < perimeter.length; index += 1) {
		const frontA = perimeter[index];
		const frontB = perimeter[(index + 1) % perimeter.length];
		const backA = frontA + backOffset;
		const backB = frontB + backOffset;
		indices.push(frontA, backA, frontB, frontB, backA, backB);
	}
}

/** Returns a non-duplicated clockwise ring around the front grid boundary. */
function createFrontPerimeter() {
	const { columns, rows } = DEWLAP_GRID;
	const perimeter = [];
	for (let column = 0; column < columns; column += 1) {
		perimeter.push(column);
	}
	for (let row = 1; row < rows; row += 1) {
		perimeter.push(row * columns + columns - 1);
	}
	for (let column = columns - 2; column >= 0; column -= 1) {
		perimeter.push((rows - 1) * columns + column);
	}
	for (let row = rows - 2; row > 0; row -= 1) {
		perimeter.push(row * columns);
	}
	return perimeter;
}
