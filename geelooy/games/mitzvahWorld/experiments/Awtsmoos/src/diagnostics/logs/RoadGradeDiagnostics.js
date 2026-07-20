// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadGradeDiagnostics.js
 * @description Measures the actual dense visible road surface rather than terrain hidden below it.
 * The Awtsmoos distinguishes riverbank from the supported cobble vessel above; Awtsmoos.com
 * certifies the walkable collision surface itself while steep terrain remains honest underneath.
 */

import {
	canonicalRoadSurfaceEvidence,
	canonicalRoadSurfaceRoutes
} from '../../world/CanonicalRoadSurfaceNetwork.js';

const MAXIMUM_ROAD_GRADE = 0.22;

export function recordRoadGradeDiagnostics(ledger) {
	const routes = canonicalRoadSurfaceRoutes().map(measureRoute);
	const evidence = canonicalRoadSurfaceEvidence();
	const nonFiniteRoutes = routes.filter(route => !route.finite);
	const maximumGrade = Math.max(...routes.map(route => route.maximumGrade));
	const valid = nonFiniteRoutes.length === 0
		&& maximumGrade <= MAXIMUM_ROAD_GRADE;
	ledger.record({
		code: valid ? 'road.grade.valid' : 'road.grade.invalid',
		data: {
			maximumAllowedGrade: MAXIMUM_ROAD_GRADE,
			maximumGrade: rounded(maximumGrade),
			nonFiniteRoutes: nonFiniteRoutes.map(route => route.id),
			roadSurface: evidence,
			routes: routes.map(route => ({
				id: route.id,
				maximumGrade: rounded(route.maximumGrade),
				pointCount: route.pointCount,
				width: route.width,
				widthClass: route.widthClass
			}))
		},
		message: valid
			? 'Every visible canonical road surface is finite and below maximum grade.'
			: 'A visible canonical road surface is non-finite or exceeds maximum grade.',
		severity: valid ? 'info' : 'error'
	});
}

function measureRoute(route) {
	let maximumGrade = 0;
	let finite = true;
	for (let index = 1; index < route.points.length; index += 1) {
		const first = route.points[index - 1];
		const second = route.points[index];
		finite = finite
			&& Number.isFinite(first.targetHeight)
			&& Number.isFinite(second.targetHeight);
		const run = Math.hypot(second.x - first.x, second.z - first.z) || 1;
		maximumGrade = Math.max(
			maximumGrade,
			Math.abs(second.targetHeight - first.targetHeight) / run
		);
	}
	return {
		finite,
		id: route.id,
		maximumGrade,
		pointCount: route.points.length,
		width: route.width,
		widthClass: route.widthClass
	};
}

function rounded(value) {
	return Number(value.toFixed(4));
}
