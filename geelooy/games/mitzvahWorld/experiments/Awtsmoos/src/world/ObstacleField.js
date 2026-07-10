// B"H
import { createHouseDefs } from './House3D.js';
import { createObstacleTestCourse } from './ObstacleTestCourse.js';

/** Combines the preserved test course with measured production houses. */
export function createObstacleField(assets = {}, groundSampler) {
	const houses = createHouseDefs(assets, groundSampler);
	const definitions = [
		...createObstacleTestCourse(),
		...houses
	];
	definitions.assets = assets;
	definitions.userData = houses.userData;
	return definitions;
}
