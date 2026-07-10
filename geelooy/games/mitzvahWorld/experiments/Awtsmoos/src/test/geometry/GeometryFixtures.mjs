// B"H
import { createHouseDefs } from '../../world/House3D.js';
import { houseAllSpecs } from '../../world/House3D.js';
import { createStoryFloorPieces } from '../../world/StoryFloorSystem.js';
import { createHouseMaterials } from '../../world/house/HouseMaterials.js';
import { resolveHouseSpec } from '../../world/house/HouseSpec.js';
import { planHouseStaircase } from '../../world/house/HouseStairSystem.js';
import { createRoadGraph } from '../../world/road/RoadGraph.js';
import { planRoadRoutes } from '../../world/road/RoadRoutePlanner.js';
import { createRoadStrip } from '../../world/road/RoadStripGeometry.js';
import { houseAllAnchors } from '../../world/House3D.js';

export const flatSampler = Object.freeze({
	heightAt(x, z) {
		return { y: Math.sin(x * 0.001) * 0.01 + Math.cos(z * 0.001) * 0.01, source: 'test-sampler' };
	}
});

export function createGeometryFixtures() {
	const definitions = createHouseDefs({}, flatSampler);
	const specs = houseAllSpecs().map((spec) => resolveHouseSpec(spec, flatSampler));
	const materials = createHouseMaterials({});
	const stairPackages = specs
		.filter((spec) => spec.floors > 1)
		.map((spec) => {
			const layout = planHouseStaircase(spec, 0, 1);
			const floors = createStoryFloorPieces({ spec, material: materials.stone, level: 1 });
			return { spec, layout, floors };
		});
	const anchors = houseAllAnchors();
	const graph = createRoadGraph([anchors.main, ...anchors.district]);
	const routes = planRoadRoutes(graph);
	const road = createRoadStrip(routes, flatSampler, null);
	return { definitions, specs, stairPackages, graph, routes, road };
}
