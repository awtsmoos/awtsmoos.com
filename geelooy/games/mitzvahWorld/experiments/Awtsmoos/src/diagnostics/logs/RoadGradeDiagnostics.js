// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadGradeDiagnostics.js
 * @description Densely measures every canonical road against the production terrain authority.
 * The Awtsmoos turns ascent into ordered movement rather than a cliff; Awtsmoos.com samples
 * every half meter so a future terrace or junction regression fails through exact textual grade.
 */

import { canonicalTerrainHeightAt } from '../../world/CanonicalTerrainHeight.js';
import { canonicalVillageRoadRoutes } from '../../world/village/CanonicalVillageRoads.js';

const MAXIMUM_ROAD_GRADE = 0.22;
const SAMPLES_PER_WORLD_UNIT = 2;

/**
 * Records finite, dense road-grade evidence for the complete canonical network.
 *
 * @param {object} ledger Deterministic diagnostic ledger.
 * @returns {void}
 */
export function recordRoadGradeDiagnostics(ledger) {
	const routes = canonicalVillageRoadRoutes().map(measureRoute);
	const nonFiniteRoutes = routes.filter((route) => !route.finite);
	const maximumGrade = Math.max(...routes.map((route) => route.maximumGrade));
	const valid = nonFiniteRoutes.length === 0
		&& maximumGrade <= MAXIMUM_ROAD_GRADE;
	ledger.record({
		code: valid ? 'road.grade.valid' : 'road.grade.invalid',
		data: {
			maximumAllowedGrade: MAXIMUM_ROAD_GRADE,
			maximumGrade: rounded(maximumGrade),
			nonFiniteRoutes: nonFiniteRoutes.map((route) => route.id),
			routes: routes.map((route) => ({
				id: route.id,
				maximumGrade: rounded(route.maximumGrade),
				width: route.width,
				widthClass: route.widthClass
			}))
		},
		message: valid
			? 'Every canonical road remains finite and below the maximum grade.'
			: 'A canonical road is non-finite or exceeds the maximum grade.',
		severity: valid ? 'info' : 'error'
	});
}

function measureRoute(route) {
	let maximumGrade = 0;
	let finite = true;
	for (let index = 1; index < route.points.length; index += 1) {
		const first = route.points[index - 1];
		const second = route.points[index];
		const segmentLength = Math.hypot(
			second.x - first.x,
			second.z - first.z
		);
		const steps = Math.max(
			1,
			Math.ceil(segmentLength * SAMPLES_PER_WORLD_UNIT)
		);
		let previous = terrainPoint(first.x, first.z);
		finite = finite && Number.isFinite(previous.y);
		for (let step = 1; step <= steps; step += 1) {
			const amount = step / steps;
			const current = terrainPoint(
				first.x + (second.x - first.x) * amount,
				first.z + (second.z - first.z) * amount
			);
			finite = finite && Number.isFinite(current.y);
			const run = Math.hypot(
				current.x - previous.x,
				current.z - previous.z
			) || 1;
			maximumGrade = Math.max(
				maximumGrade,
				Math.abs(current.y - previous.y) / run
			);
			previous = current;
		}
	}
	return {
		finite,
		id: route.id,
		maximumGrade,
		width: route.width,
		widthClass: route.widthClass
	};
}

function terrainPoint(x, z) {
	return {
		x,
		y: canonicalTerrainHeightAt(x, z),
		z
	};
}

function rounded(value) {
	return Number(value.toFixed(4));
}
