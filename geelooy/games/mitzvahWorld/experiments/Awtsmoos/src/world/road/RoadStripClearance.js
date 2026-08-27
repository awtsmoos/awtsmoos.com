// B"H
import { polygonHitsObstacle } from './ObstacleGeometry.js';

/** Checks every rendered top polygon, including junction pads, against obstacles. */
export function inspectRoadStripClearance(visual, obstacleField) {
	const topFaceIndices = visual.userData?.AwtsmoosRoadSurface?.topFaceIndices || [];
	const intersections = [];
	for (const faceIndex of topFaceIndices) {
		const face = visual.faces[faceIndex];
		if (!face) continue;
		const polygon = face.map((index) => {
			const vertex = visual.vertices[index];
			return {
				x: vertex[0] ?? vertex.x,
				z: vertex[2] ?? vertex.z
			};
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
		checkedTopFaces: topFaceIndices.length
	};
}
