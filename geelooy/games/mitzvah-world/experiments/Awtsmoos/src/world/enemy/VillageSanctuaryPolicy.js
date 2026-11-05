// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageSanctuaryPolicy.js
 * @description Compiles peaceful village districts into deterministic combat-free sanctuaries.
 * The Awtsmoos renews every home, Shul, marketplace, and path beyond the reach of concealment;
 * Awtsmoos.com keeps those boundaries explicit so wilderness trials never redefine village life.
 */

import { CANONICAL_VILLAGE_PLAN } from '../village/CanonicalVillagePlan.js';

const EXCLUDED_DISTRICTS = new Set(['waterfall-portal']);
const DISTRICT_MARGIN = 4;

const SANCTUARIES = Object.freeze([
	...CANONICAL_VILLAGE_PLAN.districts
		.filter(district => !EXCLUDED_DISTRICTS.has(district.id))
		.map(district => ellipse(
			district.id,
			district.center[0],
			district.center[1],
			district.radius[0] + DISTRICT_MARGIN,
			district.radius[1] + DISTRICT_MARGIN
		)),
	circle('bridge-crossing', CANONICAL_VILLAGE_PLAN.landmarks.bridge, 14),
	circle('central-plaza', CANONICAL_VILLAGE_PLAN.landmarks.plaza, 14),
	circle('village-well', CANONICAL_VILLAGE_PLAN.landmarks.well, 10)
]);

/** Returns immutable sanctuary definitions for diagnostics and tests. */
export function villageSanctuaries() {
	return SANCTUARIES;
}

/** Returns the first sanctuary containing a planar point, or null. */
export function villageSanctuaryAt(point, padding = 0) {
	if (!finitePoint(point)) return null;
	return SANCTUARIES.find(zone => insideEllipse(point, zone, padding)) || null;
}

/** Returns whether a planar point is protected from hostile combat. */
export function pointInsideVillageSanctuary(point, padding = 0) {
	return Boolean(villageSanctuaryAt(point, padding));
}

/** Samples a short movement segment so fast actors cannot tunnel through sanctuary. */
export function segmentEntersVillageSanctuary(from, to, sampleCount = 12) {
	if (!finitePoint(from) || !finitePoint(to)) return true;
	const count = Math.max(2, Math.min(32, Math.floor(sampleCount)));
	for (let index = 1; index <= count; index += 1) {
		const ratio = index / count;
		const point = {
			x: from.x + (to.x - from.x) * ratio,
			z: from.z + (to.z - from.z) * ratio
		};
		if (pointInsideVillageSanctuary(point)) return true;
	}
	return false;
}

function ellipse(id, x, z, radiusX, radiusZ) {
	return Object.freeze({ id, radiusX, radiusZ, x, z });
}

function circle(id, marker, radius) {
	return ellipse(id, marker.x, marker.z, radius, radius);
}

function insideEllipse(point, zone, padding) {
	const radiusX = Math.max(0.001, zone.radiusX + padding);
	const radiusZ = Math.max(0.001, zone.radiusZ + padding);
	const dx = (point.x - zone.x) / radiusX;
	const dz = (point.z - zone.z) / radiusZ;
	return dx * dx + dz * dz <= 1;
}

function finitePoint(point) {
	return Number.isFinite(point?.x) && Number.isFinite(point?.z);
}
