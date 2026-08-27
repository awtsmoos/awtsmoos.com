// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalGeometryBuffer.js
 * @description Collects many botanical gestures into one indexed vessel. The
 * Awtsmoos is not divided by the many vertices; one buffer carries them all.
 */
export class BotanicalGeometryBuffer {
	constructor() {
		this.vertices = [];
		this.faces = [];
	}

	addPoint(x, y, z) {
		this.vertices.push([x, y, z]);
		return this.vertices.length - 1;
	}

	addTriangle(a, b, c) {
		this.faces.push([a, b, c]);
	}

	addQuad(points) {
		const indices = points.map((point) => this.addPoint(...point));
		this.addTriangle(indices[0], indices[1], indices[2]);
		this.addTriangle(indices[0], indices[2], indices[3]);
	}

	addDiamond(center, width, height, yaw = 0) {
		const right = [Math.cos(yaw) * width, 0, Math.sin(yaw) * width];
		const points = [
			[center[0], center[1] - height, center[2]],
			[center[0] + right[0], center[1], center[2] + right[2]],
			[center[0], center[1] + height, center[2]],
			[center[0] - right[0], center[1], center[2] - right[2]]
		];
		this.addQuad(points);
	}

	addOctahedron(center, radius) {
		const start = this.vertices.length;
		const [x, y, z] = center;
		this.vertices.push(
			[x, y + radius, z],
			[x + radius, y, z],
			[x, y, z + radius],
			[x - radius, y, z],
			[x, y, z - radius],
			[x, y - radius, z]
		);
		for (const face of OCTAHEDRON_FACES) {
			this.faces.push(face.map((index) => start + index));
		}
	}

	append(geometry) {
		const offset = this.vertices.length;
		this.vertices.push(...geometry.vertices.map((point) => [...point]));
		this.faces.push(...geometry.faces.map((face) => face.map((index) => index + offset)));
	}

	toGeometry() {
		return {
			vertices: this.vertices,
			faces: this.faces,
			bounds: geometryBounds(this.vertices)
		};
	}
}

const OCTAHEDRON_FACES = Object.freeze([
	[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
	[5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4]
]);

export function geometryBounds(vertices) {
	const minimum = [Infinity, Infinity, Infinity];
	const maximum = [-Infinity, -Infinity, -Infinity];
	for (const point of vertices) {
		for (let axis = 0; axis < 3; axis += 1) {
			minimum[axis] = Math.min(minimum[axis], point[axis]);
			maximum[axis] = Math.max(maximum[axis], point[axis]);
		}
	}
	return { minimum, maximum };
}
