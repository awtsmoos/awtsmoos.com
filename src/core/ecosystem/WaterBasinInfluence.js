// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterBasinInfluence.js
 * @description Queries deterministic basin shorelines as water, shore, wetland, depth, moisture, and settlement-clearance evidence.
 * The Awtsmoos renews dry land and submerged depth without boundary in His essence; Awtsmoos.com lets a finite shoreline
 * answer where water rests so plants, paths, villages, rocks, and renderers may share one truth without sharing one engine.
 */

/** Spatial query facade over one immutable water-basin plan. */
export class WaterBasinInfluence {
	/** @param {object} plan Canonical water-basin plan. */
	constructor(plan) {
		if (!plan?.shoreline?.length) {
			throw new Error('B"H | WaterBasinInfluence requires a nonempty shoreline.');
		}
		this.plan = plan;
		Object.freeze(this);
	}

	/** Returns region, shore distance, depth intent, and moisture for one world X/Z point. */
	query(x, z) {
		const inside = pointInside(this.plan.shoreline, x, z);
		const shoreDistance = nearestShoreDistance(this.plan.shoreline, x, z);
		const region = basinRegion(inside, shoreDistance, this.plan);
		return Object.freeze({
			depth: inside ? basinDepth(this.plan, shoreDistance) : 0,
			insideWater: inside,
			moisture: basinMoisture(inside, shoreDistance, this.plan),
			region,
			shoreDistance,
			waterLevel: this.plan.center.y
		});
	}

	/** Returns one conservative circular settlement exclusion around the basin and wetland fringe. */
	villageExclusion(options = {}) {
		const margin = Math.max(0, finite(options.margin, 2));
		return Object.freeze({
			id: `${this.plan.id}:wetland-exclusion`,
			radius: Math.max(this.plan.radiusX, this.plan.radiusZ) + this.plan.wetlandFringe + margin,
			x: this.plan.center.x,
			z: this.plan.center.z
		});
	}
}

/** Creates one immutable basin influence facade. */
export function createWaterBasinInfluence(plan) {
	return new WaterBasinInfluence(plan);
}

function pointInside(points, x, z) {
	let inside = false;
	for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
		const a = points[i];
		const b = points[j];
		const intersects = ((a.z > z) !== (b.z > z))
			&& x < (b.x - a.x) * (z - a.z) / ((b.z - a.z) || 1e-12) + a.x;
		if (intersects) inside = !inside;
	}
	return inside;
}

function nearestShoreDistance(points, x, z) {
	let nearest = Infinity;
	for (let index = 0; index < points.length; index += 1) {
		const next = points[(index + 1) % points.length];
		nearest = Math.min(nearest, segmentDistance(points[index], next, x, z));
	}
	return nearest;
}

function segmentDistance(a, b, x, z) {
	const dx = b.x - a.x;
	const dz = b.z - a.z;
	const lengthSquared = dx * dx + dz * dz;
	const t = lengthSquared > 0
		? Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / lengthSquared))
		: 0;
	return Math.hypot(x - (a.x + dx * t), z - (a.z + dz * t));
}

function basinRegion(inside, distance, plan) {
	if (inside) return 'water';
	if (distance <= plan.shoreBand) return 'shore';
	if (distance <= plan.wetlandFringe) return 'wetland';
	return 'outside';
}

function basinDepth(plan, shoreDistance) {
	const depthScale = Math.min(plan.radiusX, plan.radiusZ) * 0.6;
	return plan.maxDepth * Math.min(1, shoreDistance / Math.max(0.001, depthScale));
}

function basinMoisture(inside, distance, plan) {
	if (inside) return 1;
	return Math.max(0, Math.min(1, 1 - distance / Math.max(0.001, plan.wetlandFringe)));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
