// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dBufferOperations.js
 * @description Performs deterministic visible position-buffer transforms and topology expansion.
 * The Awtsmoos renews every point before form can claim continuity; Awtsmoos.com gives set-position,
 * scale, bevel, extrude, subdivision, and decimation finite truthful algorithms.
 */

export function applyMovieBufferOperation(source, node) {
	if (node.type === 'setPosition') return offsetPositions(source, vector(node.offset || node.position));
	if (node.type === 'scaleElements') return scalePositions(source, vector(node.scale, [1, 1, 1]));
	if (node.type === 'bevel') return bevelPositions(source, Number(node.amount || 0.05));
	if (node.type === 'extrude') return extrudePositions(source, vector(node.offset, [0, 0.1, 0]));
	if (node.type === 'subdivide') return subdivideTriangles(source, bounded(node.levels, 1, 2, 1));
	if (['decimate', 'deleteGeometry'].includes(node.type)) {
		return decimateTriangles(source, bounded(node.ratio, 0.05, 1, 0.5));
	}
	return null;
}

export function movieBufferOperationSupported(type) {
	return new Set(['bevel', 'decimate', 'deleteGeometry', 'extrude', 'scaleElements', 'setPosition', 'subdivide']).has(type);
}

function offsetPositions(source, offset) {
	return mapVertices(source, ([x, y, z]) => [x + offset[0], y + offset[1], z + offset[2]]);
}

function scalePositions(source, scale) {
	const center = centroid(source);
	return mapVertices(source, ([x, y, z]) => [
		center[0] + (x - center[0]) * scale[0],
		center[1] + (y - center[1]) * scale[1],
		center[2] + (z - center[2]) * scale[2]
	]);
}

function bevelPositions(source, amount) {
	const center = centroid(source);
	return mapVertices(source, ([x, y, z]) => {
		const direction = [x - center[0], y - center[1], z - center[2]];
		const length = Math.hypot(...direction) || 1;
		return [x + direction[0] / length * amount, y + direction[1] / length * amount, z + direction[2] / length * amount];
	});
}

function extrudePositions(source, offset) {
	const output = new Float32Array(source.length * 2);
	output.set(source, 0);
	for (let index = 0; index < source.length; index += 3) {
		const target = source.length + index;
		output[target] = source[index] + offset[0];
		output[target + 1] = source[index + 1] + offset[1];
		output[target + 2] = source[index + 2] + offset[2];
	}
	return output;
}

function subdivideTriangles(source, levels) {
	let output = new Float32Array(source);
	for (let level = 0; level < levels; level += 1) output = subdivideOnce(output);
	return output;
}

function subdivideOnce(source) {
	if (source.length % 9 !== 0) return new Float32Array(source);
	const triangles = [];
	for (let index = 0; index < source.length; index += 9) {
		const a = vertex(source, index);
		const b = vertex(source, index + 3);
		const c = vertex(source, index + 6);
		const ab = midpoint(a, b);
		const bc = midpoint(b, c);
		const ca = midpoint(c, a);
		triangles.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
	}
	return new Float32Array(triangles.flat());
}

function decimateTriangles(source, ratio) {
	if (source.length % 9 !== 0) return new Float32Array(source);
	const keep = Math.max(1, Math.round(source.length / 9 * ratio));
	return new Float32Array(source.slice(0, keep * 9));
}

function mapVertices(source, transform) {
	const output = new Float32Array(source.length);
	for (let index = 0; index < source.length; index += 3) output.set(transform(vertex(source, index)), index);
	return output;
}

function centroid(source) {
	const center = [0, 0, 0];
	const count = source.length / 3 || 1;
	for (let index = 0; index < source.length; index += 3) {
		center[0] += source[index];
		center[1] += source[index + 1];
		center[2] += source[index + 2];
	}
	return center.map(value => value / count);
}

function vertex(source, index) { return [source[index], source[index + 1], source[index + 2]]; }
function midpoint(left, right) { return left.map((value, index) => (value + right[index]) / 2); }
function vector(value, fallback = [0, 0, 0]) { return Array.isArray(value) ? value.map(Number) : [...fallback]; }
function bounded(value, minimum, maximum, fallback) { const number = Number(value); return Math.max(minimum, Math.min(maximum, Number.isFinite(number) ? number : fallback)); }
