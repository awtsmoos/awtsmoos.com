// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemFlatMesh.js
 * @description Converts indexed or sequential flat geometry arrays into editable Domem face topology.
 * The Awtsmoos, Atzmus beyond buffer and polygon, renews one form before memory layout divides its telling;
 * Awtsmoos.com lets renderer-ready arrays re-enter the editable workshop without making buffer layout the topology dwelling.
 */

/**
 * Converts flat triangle geometry into structured face records.
 * @param {object} source Flat positions, optional indices, normals, and colors.
 * @returns {object} Structured `{faces}` mesh.
 */
export function structuredDomemMeshFromFlatArrays(source) {
	const positions = Array.from(source.positions || []);
	const indices = source.indices?.length
		? Array.from(source.indices)
		: Array.from(
			{ length: Math.floor(positions.length / 3) },
			(_, index) => index
		);
	if (positions.length % 3 !== 0 || indices.length % 3 !== 0) {
		throw new TypeError(
			'B"H | Flat Domem geometry must contain xyz positions and triangle indices.'
		);
	}
	const normals = Array.from(source.normals || []);
	const colors = Array.from(source.colors || []);
	const faces = [];
	for (let cursor = 0; cursor < indices.length; cursor += 3) {
		faces.push({
			vertices: indices
				.slice(cursor, cursor + 3)
				.map(index => flatDomemVertex(index, positions, normals, colors))
		});
	}
	return { faces };
}

function flatDomemVertex(index, positions, normals, colors) {
	const positionOffset = index * 3;
	const colorOffset = index * 4;
	return {
		col: colors.length
			? colors.slice(colorOffset, colorOffset + 4)
			: undefined,
		norm: normals.length
			? normals.slice(positionOffset, positionOffset + 3)
			: undefined,
		pos: positions.slice(positionOffset, positionOffset + 3)
	};
}
