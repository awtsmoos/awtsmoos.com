// B"H
import { houseAllAnchors, houseAllSpecs } from '../../world/House3D.js';
import { createObstacleField } from '../../world/ObstacleField.js';
import {
	ROAD_SAFETY_MARGIN,
	ROAD_WIDTH
} from '../../world/PathRoadSystem.js';
import { createStoryFloorPieces } from '../../world/StoryFloorSystem.js';
import { createHouseMaterials } from '../../world/house/HouseMaterials.js';
import { resolveHouseSpec } from '../../world/house/HouseSpec.js';
import { planHouseStaircase } from '../../world/house/HouseStairSystem.js';
import { inspectStairTraversal } from '../../world/house/StairTraversalProbe.js';
import { createStairSolidDefinition } from '../../world/house/StairVisualGeometry.js';
import { createRoadGraph } from '../../world/road/RoadGraph.js';
import { planRoadRoutes } from '../../world/road/RoadRoutePlanner.js';
import { createRoadStrip } from '../../world/road/RoadStripGeometry.js';
import { inspectRoadStripClearance } from '../../world/road/RoadStripClearance.js';
import {
	createStaticObstacleField,
	routeIntersections
} from '../../world/road/StaticObstacleField.js';

export const flatSampler = Object.freeze({
	heightAt(x, z) {
		return {
			x,
			y: Math.sin(x * 0.001) * 0.01 + Math.cos(z * 0.001) * 0.01,
			z,
			source: 'test-sampler'
		};
	}
});

export function createGeometryFixtures() {
	const definitions = createObstacleField({}, flatSampler);
	const specs = houseAllSpecs().map((spec) => resolveHouseSpec(spec, flatSampler));
	const materials = createHouseMaterials({});
	const stairPackages = specs
		.filter((spec) => spec.floors > 1)
		.map((spec) => stairPackage(spec, materials.stone));
	const anchors = houseAllAnchors();
	const graph = createRoadGraph([anchors.main, ...anchors.district]);
	const rawField = createStaticObstacleField(definitions, specs, ROAD_SAFETY_MARGIN);
	const planningField = createStaticObstacleField(
		definitions,
		specs,
		ROAD_WIDTH / 2 + ROAD_SAFETY_MARGIN
	);
	const routes = planRoadRoutes(graph, planningField);
	const road = createRoadStrip(routes, flatSampler, null, ROAD_WIDTH);
	return {
		definitions,
		specs,
		stairPackages,
		graph,
		routes,
		road,
		roadClearance: inspectRoadStripClearance(road.visual, rawField),
		centerlineIntersections: routeIntersections(planningField, routes),
		rawField,
		planningField,
		roofs: definitions.filter((item) => item.userData?.AwtsmoosRoof),
		yardGrass: definitions.filter((item) => item.userData?.AwtsmoosYardGrass)
	};
}

function stairPackage(spec, material) {
	const layout = planHouseStaircase(spec, 0, 1);
	const floors = createStoryFloorPieces({ spec, material, level: 1 });
	const solid = createStairSolidDefinition(layout, spec, material);
	const traversal = inspectStairTraversal(layout, spec, solid);
	return { spec, layout, floors, solid, traversal };
}
