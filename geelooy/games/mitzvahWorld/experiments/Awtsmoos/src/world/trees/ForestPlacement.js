// B"H
/**
 * @file ForestPlacement.js
 * @description Deterministic terrain placement against measured world truth.
 */
const GOLDEN_TURN = .6180339887498949;

function hash(index, seed, channel = 0) {
	const value = Math.sin((index + 1) * 127.1 + seed * 311.7 + channel * 74.7) * 43758.5453;
	return value - Math.floor(value);
}

function obstacleBounds(triangles) {
	const groups = new Map();
	for (const triangle of triangles) {
		const bounds = groups.get(triangle.kind) || {
			minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity
		};
		for (const point of [triangle.a, triangle.b, triangle.c]) {
			bounds.minX = Math.min(bounds.minX, point.x);
			bounds.maxX = Math.max(bounds.maxX, point.x);
			bounds.minZ = Math.min(bounds.minZ, point.z);
			bounds.maxZ = Math.max(bounds.maxZ, point.z);
		}
		groups.set(triangle.kind, bounds);
	}
	return Array.from(groups.values());
}

function distanceToSegment(point, first, second) {
	const dx = second.x - first.x;
	const dz = second.z - first.z;
	const lengthSquared = dx * dx + dz * dz || 1;
	const amount = Math.max(0, Math.min(1, (
		(point.x - first.x) * dx + (point.z - first.z) * dz
	) / lengthSquared));
	return Math.hypot(
		point.x - (first.x + dx * amount),
		point.z - (first.z + dz * amount)
	);
}

function triangleContains(point, triangle) {
	const sign = (a, b, c) => (
		(a.x - c.x) * (b.z - c.z) - (b.x - c.x) * (a.z - c.z)
	);
	const first = sign(point, triangle.a, triangle.b);
	const second = sign(point, triangle.b, triangle.c);
	const third = sign(point, triangle.c, triangle.a);
	return !(first < 0 || second < 0 || third < 0)
		|| !(first > 0 || second > 0 || third > 0);
}

function distanceToRoad(point, triangles) {
	let distance = Infinity;
	for (const triangle of triangles) {
		if (triangleContains(point, triangle)) return 0;
		distance = Math.min(
			distance,
			distanceToSegment(point, triangle.a, triangle.b),
			distanceToSegment(point, triangle.b, triangle.c),
			distanceToSegment(point, triangle.c, triangle.a)
		);
	}
	return distance;
}

function distanceToBounds(point, bounds) {
	const dx = Math.max(bounds.minX - point.x, 0, point.x - bounds.maxX);
	const dz = Math.max(bounds.minZ - point.z, 0, point.z - bounds.maxZ);
	return Math.hypot(dx, dz);
}

function candidate(index, attempt, seed, halfSize) {
	const turn = (index * GOLDEN_TURN + hash(attempt, seed, index)) % 1;
	const radius = 58 + Math.sqrt(hash(index, seed + attempt, 2)) * (halfSize - 70);
	return {
		x: Math.cos(turn * Math.PI * 2) * radius,
		z: Math.sin(turn * Math.PI * 2) * radius
	};
}

export function createForestPlacements(policies, options) {
	const placements = [];
	const rejections = { road: 0, obstacle: 0, spawn: 0, slope: 0, spacing: 0 };
	const bounds = obstacleBounds(options.obstacleTriangles || []);
	const roadTriangles = options.roadTriangles || [];
	const halfSize = options.halfSize || 250;
	const seed = options.seed || 613;
	for (const policy of policies) {
		let accepted = null;
		for (let attempt = 0; attempt < 180 && !accepted; attempt += 1) {
			const point = candidate(policy.index, attempt, seed, halfSize);
			if (Math.hypot(point.x, point.z) < 32) { rejections.spawn += 1; continue; }
			if (distanceToRoad(point, roadTriangles) < 5.4) { rejections.road += 1; continue; }
			if (bounds.some((box) => distanceToBounds(point, box) < 4.8)) { rejections.obstacle += 1; continue; }
			const sample = options.groundSampler.heightAt(point.x, point.z);
			if ((sample.normal?.y ?? 1) < .82) { rejections.slope += 1; continue; }
			if (placements.some((item) => Math.hypot(point.x - item.x, point.z - item.z) < Math.max(7, Math.min(item.policy.spacing, policy.spacing)))) {
				rejections.spacing += 1;
				continue;
			}
			accepted = { ...point, y: sample.y, sample, rotationY: hash(policy.index, seed, 9) * Math.PI * 2, policy };
		}
		if (accepted) placements.push(accepted);
	}
	return {
		placements,
		rejections,
		sources: ['road-collider-triangles', 'obstacle-collider-bounds', 'terrain-normal', 'spawn-clearance']
	};
}

export default createForestPlacements;
