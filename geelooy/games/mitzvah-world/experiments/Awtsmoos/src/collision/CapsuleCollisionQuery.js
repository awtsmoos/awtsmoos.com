// B"H
import { Aabb } from '../math/Aabb.js';
import { capsuleTriangleContact } from './CapsuleTriangle.js';

export function capsuleFor(position, radius, height, footOffset) {
	const base = position.y - footOffset;
	return {
		radius,
		start: { x: position.x, y: base + 0.25, z: position.z },
		end: { x: position.x, y: base + height, z: position.z }
	};
}

export function deepestContact({ octree, capsule, radius, options, accept }) {
	let best = null;
	for (const triangle of candidates(octree, capsule, radius, options)) {
		const hit = capsuleTriangleContact(capsule, triangle);
		if (!hit || !accept(triangle, hit)) continue;
		if (!best || hit.depth > best.depth) best = hit;
	}
	return best;
}

function candidates(octree, capsule, radius, options) {
	const bounds = capsuleBounds(capsule, radius);
	const dynamic = (options.dynamicColliders || []).filter((triangle) => (
		triangle.aabb?.intersects?.(bounds)
	));
	return [...octree.query(bounds), ...dynamic];
}

function capsuleBounds(capsule, radius) {
	const margin = radius + 0.04;
	return new Aabb(
		{
			x: capsule.start.x - margin,
			y: Math.min(capsule.start.y, capsule.end.y) - margin,
			z: capsule.start.z - margin
		},
		{
			x: capsule.start.x + margin,
			y: Math.max(capsule.start.y, capsule.end.y) + margin,
			z: capsule.start.z + margin
		}
	);
}
