// B"H
import { TriangleCollider } from '../collision/TriangleCollider.js';
import { triangleNormal, v } from '../math/Geometry3D.js';

const LAKE = { x: -34, z: -18, radiusX: 18, radiusZ: 12 };
const PLAZA = { x: 0, z: 3, radius: 15 };

/** Hyper-real terrain height: hills, valley basin, stream trench, plaza pads. */
export function terrainHeightAt(x, z) {
	const hills = ridgeNoise(x, z) + mountainShoulders(x, z);
	const basin = lakeBasin(x, z);
	const stream = streamChannel(x, z);
	const plaza = flattenNear(x, z, PLAZA.x, PLAZA.z, PLAZA.radius, 0.16);
	const houses = housePadFlatten(x, z);
	return mix(hills + basin + stream, 0.08, Math.max(plaza, houses));
}

export function terrainZoneAt(x, z) {
	const lake = ellipticalDistance(x, z, LAKE);
	const stream = streamDistance(x, z).distance;
	if (lake < 1) return 'lake-basin';
	if (stream < 2.4) return 'stream-channel';
	if (flattenNear(x, z, PLAZA.x, PLAZA.z, PLAZA.radius, 0.16) > 0.5) return 'village-plaza';
	if (z < -50 || x > 80) return 'distant-hills';
	return 'grass-valley';
}

/** Generates a detailed but browser-safe valley terrain and its static colliders. */
export function createTerrainGeometry(size = 540, steps = 56) {
	const vertices = [];
	const uvs = [];
	const indices = [];
	const zones = [];
	const half = size / 2;
	for (let zIndex = 0; zIndex <= steps; zIndex += 1) {
		for (let xIndex = 0; xIndex <= steps; xIndex += 1) {
			const x = -half + size * xIndex / steps;
			const z = -half + size * zIndex / steps;
			vertices.push(v(x, terrainHeightAt(x, z), z));
			uvs.push(xIndex / steps, zIndex / steps);
			zones.push(terrainZoneAt(x, z));
		}
	}
	for (let zIndex = 0; zIndex < steps; zIndex += 1) {
		for (let xIndex = 0; xIndex < steps; xIndex += 1) {
			const first = zIndex * (steps + 1) + xIndex;
			const second = first + 1;
			const third = first + steps + 1;
			const fourth = third + 1;
			indices.push(first, third, second, second, third, fourth);
		}
	}
	return {
		vertices,
		uvs,
		indices,
		zones,
		normals: vertexNormals(vertices, indices),
		size,
		steps,
		colliders: colliderList(vertices, indices),
		AwtsmoosTerrainValley: {
			lake: LAKE,
			plaza: PLAZA,
			stream: 'sine-river-carved-channel',
			grid: `${steps}x${steps}`,
			colliderTriangles: indices.length / 3,
			performancePolicy: 'browser-safe-hyperreal-heightfield-with-shader-detail-not-excess-colliders'
		}
	};
}

function ridgeNoise(x, z) {
	return Math.sin(x * 0.021) * 0.35
		+ Math.cos(z * 0.019) * 0.28
		+ Math.sin((x + z) * 0.011) * 0.22
		+ Math.sin(Math.hypot(x + 40, z - 20) * 0.035) * 0.36;
}

function mountainShoulders(x, z) {
	return gaussian(x, z, -95, -70, 110, 2.8)
		+ gaussian(x, z, 105, -40, 140, 3.6)
		+ gaussian(x, z, 12, -125, 160, 3.2);
}

function lakeBasin(x, z) {
	const d = ellipticalDistance(x, z, LAKE);
	if (d > 1.65) return 0;
	return -2.4 * smooth(1.65, 0, d) - smooth(1.15, 0.78, d) * 0.45;
}

function streamChannel(x, z) {
	const { distance, t } = streamDistance(x, z);
	const width = 3.4 + Math.sin(t * Math.PI) * 1.2;
	return -0.55 * smooth(width + 3.8, 0, distance) - 0.58 * smooth(width, 0, distance);
}

function streamDistance(x, z) {
	let best = { distance: Infinity, t: 0 };
	for (let i = 0; i <= 44; i += 1) {
		const t = i / 44;
		const cx = -46 + t * 92;
		const cz = 18 * Math.sin(t * Math.PI * 1.35) - 18 + t * 24;
		const distance = Math.hypot(x - cx, z - cz);
		if (distance < best.distance) best = { distance, t };
	}
	return best;
}

function housePadFlatten(x, z) {
	const pads = [[-20, 18], [22, 18], [-20, -2], [22, -2], [0, 24]];
	return Math.max(...pads.map(([px, pz]) => flattenNear(x, z, px, pz, 7.5, 0.08)));
}

function flattenNear(x, z, cx, cz, radius, floor) {
	return smooth(radius, radius * floor, Math.hypot(x - cx, z - cz));
}

function ellipticalDistance(x, z, ellipse) {
	return Math.hypot((x - ellipse.x) / ellipse.radiusX, (z - ellipse.z) / ellipse.radiusZ);
}

function gaussian(x, z, cx, cz, radius, height) {
	const d = Math.hypot(x - cx, z - cz) / radius;
	return Math.exp(-d * d) * height;
}

function smooth(edge0, edge1, value) {
	const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0 || 1)));
	return t * t * (3 - 2 * t);
}

function mix(a, b, amount) {
	return a + (b - a) * Math.max(0, Math.min(1, amount));
}

function colliderList(vertices, indices) {
	const colliders = [];
	for (let index = 0; index < indices.length; index += 3) {
		colliders.push(new TriangleCollider(vertices[indices[index]], vertices[indices[index + 1]], vertices[indices[index + 2]], { kind: 'terrain', solid: true, floor: true }));
	}
	return colliders;
}

function vertexNormals(vertices, indices) {
	const normals = new Array(vertices.length).fill(0).map(() => v());
	for (let index = 0; index < indices.length; index += 3) {
		const face = [indices[index], indices[index + 1], indices[index + 2]];
		const normal = triangleNormal(vertices[face[0]], vertices[face[1]], vertices[face[2]]);
		for (const vertexIndex of face) {
			normals[vertexIndex].x += normal.x;
			normals[vertexIndex].y += normal.y;
			normals[vertexIndex].z += normal.z;
		}
	}
	return normals.flatMap((normal) => {
		const length = Math.hypot(normal.x, normal.y, normal.z) || 1;
		return [normal.x / length, normal.y / length, normal.z / length];
	});
}
