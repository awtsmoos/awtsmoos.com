// B"H
import {
	pointInsideObstacle,
	segmentHitsObstacle
} from './ObstacleGeometry.js';
import {
	createObstacleDefinitions,
	obstacleFieldBounds
} from './StaticObstacleFactories.js';

/** Builds one immutable field shared by pathfinding, smoothing, and proof. */
export function createStaticObstacleField(definitions, houseSpecs, clearance) {
	const obstacles = createObstacleDefinitions(definitions, houseSpecs, clearance);
	return Object.freeze({
		clearance,
		obstacles: Object.freeze(obstacles),
		bounds: obstacleFieldBounds(obstacles)
	});
}

export function pointBlocked(field, point) {
	return field.obstacles.some((obstacle) => pointInsideObstacle(point, obstacle));
}

export function segmentBlocked(field, start, end) {
	return field.obstacles.some((obstacle) => segmentHitsObstacle(start, end, obstacle));
}

export function routeIntersections(field, routes) {
	const intersections = [];
	for (const route of routes) {
		for (let index = 0; index < route.points.length - 1; index += 1) {
			for (const obstacle of field.obstacles) {
				if (segmentHitsObstacle(route.points[index], route.points[index + 1], obstacle)) {
					intersections.push({
						routeId: route.id,
						segment: index,
						obstacleId: obstacle.id
					});
				}
			}
		}
	}
	return intersections;
}
