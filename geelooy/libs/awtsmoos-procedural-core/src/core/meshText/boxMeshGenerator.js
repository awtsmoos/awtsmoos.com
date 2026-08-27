// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file boxMeshGenerator.js
 * @description Six faces become a useful vessel, while rounded edges reveal
 * that even a simple box contains gradations of form. The Awtsmoos renews each
 * point from nothing, and this generator keeps every point deterministic.
 */

const SIDES = [
	{ axis: 0, sign: 1, u: 1, v: 2, flip: false },
	{ axis: 0, sign: -1, u: 1, v: 2, flip: true },
	{ axis: 1, sign: 1, u: 2, v: 0, flip: false },
	{ axis: 1, sign: -1, u: 2, v: 0, flip: true },
	{ axis: 2, sign: 1, u: 0, v: 1, flip: false },
	{ axis: 2, sign: -1, u: 0, v: 1, flip: true }
];

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

function normalized(vector) {
	const length = Math.hypot(...vector) || 1;
	return vector.map(value => value / length);
}

function createVertex(position, normal, color) {
	return { pos: position, norm: normal, col: [...color] };
}

function surfacePoint(half, side, uValue, vValue, bevel, color) {
	const point = [0, 0, 0];
	point[side.axis] = side.sign * half[side.axis];
	point[side.u] = uValue;
	point[side.v] = vValue;

	if (!bevel) {
		const normal = [0, 0, 0];
		normal[side.axis] = side.sign;
		return createVertex(point, normal, color);
	}

	const core = half.map(value => Math.max(0, value - bevel));
	const anchor = point.map((value, axis) => clamp(value, -core[axis], core[axis]));
	const delta = point.map((value, axis) => value - anchor[axis]);
	const normal = normalized(delta);
	const rounded = anchor.map((value, axis) => value + normal[axis] * bevel);
	return createVertex(rounded, normal, color);
}

function axisCoordinates(half, bevel) {
	if (!bevel) {
		return [-half, half];
	}

	const core = Math.max(0, half - bevel);
	return [-half, -core, core, half];
}

function createSurfaceMesh(recipe, requestedBevel) {
	const { width, height, depth } = recipe.dimensions;
	const half = [width / 2, height / 2, depth / 2];
	const bevel = Math.min(Math.max(0, requestedBevel), Math.min(...half) * 0.98);
	const coordinates = half.map(value => axisCoordinates(value, bevel));
	const color = recipe.materials[0].color;
	const faces = [];

	for (const side of SIDES) {
		const uCoordinates = coordinates[side.u];
		const vCoordinates = coordinates[side.v];

		for (let uIndex = 0; uIndex < uCoordinates.length - 1; uIndex += 1) {
			for (let vIndex = 0; vIndex < vCoordinates.length - 1; vIndex += 1) {
				const vertices = [
					surfacePoint(half, side, uCoordinates[uIndex], vCoordinates[vIndex], bevel, color),
					surfacePoint(half, side, uCoordinates[uIndex + 1], vCoordinates[vIndex], bevel, color),
					surfacePoint(half, side, uCoordinates[uIndex + 1], vCoordinates[vIndex + 1], bevel, color),
					surfacePoint(half, side, uCoordinates[uIndex], vCoordinates[vIndex + 1], bevel, color)
				];
				const ordered = side.flip
					? [vertices[0], vertices[3], vertices[2], vertices[1]]
					: vertices;
				faces.push({ vertices: ordered, tags: ['body'] });
			}
		}
	}

	return { faces, hasSmoothNormals: Boolean(bevel) };
}

export function createRecipeBoxMesh(recipe) {
	return createSurfaceMesh(recipe, 0);
}

export function createRecipeBeveledBoxMesh(recipe) {
	const operation = recipe.operations.find(candidate => candidate.type === 'bevel');
	return createSurfaceMesh(recipe, operation?.amount || 0.08);
}

function supportsPlainBox(recipe) {
	return recipe.generator === 'primitive.box';
}

function supportsBeveledBox(recipe) {
	return recipe.generator === 'primitive.beveledBox';
}

export const BOX_MESH_GENERATORS = [
	{ id: 'primitive.box', version: '1.0.0', rank: 10, supports: supportsPlainBox, generate: createRecipeBoxMesh },
	{ id: 'primitive.beveledBox', version: '1.0.0', rank: 20, supports: supportsBeveledBox, generate: createRecipeBeveledBoxMesh }
];
