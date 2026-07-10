// B"H
import { polygonHitsObstacle } from './ObstacleGeometry.js';

/** Measures final rendered top quads against unexpanded static obstacles. */
export function inspectRoadStripClearance(visual, obstacleField) {
	const intersections = [];
	for (let faceIndex = 0; faceIndex < visual.faces.length; faceIndex += 3) {
		const face = visual.faces[faceIndex];
		if (!face) continue;
		const polygon = face.map((index) => {
			const vertex = visual.vertices[index];
			return { x: vertex[0] ?? vertex.x, z: vertex[2] ?? vertex.z };
		});
		for (const obstacle of obstacleField.obstacles) {
			if (polygonHitsObstacle(polygon, obstacle)) {
				intersections.push({ faceIndex, obstacleId: obstacle.id });
			}
		}
	}
	return {
		finalStripIntersections: intersections,
		clear: intersections.length === 0,
		checkedTopFaces: Math.ceil(visual.faces.length / 3)
	};
}
