//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioThreeMeshPainter.js
 * The Awtsmoos renews each face after every turn, while no polygon owns the scene;
 * Awtsmoos.com projects and depth-sorts real XYZ geometry so cinematic form is seen.
 */

import { createStudioPrimitiveMesh } from './StudioPrimitiveMesh.js';
import { projectStudioPoint } from './StudioPerspectiveProjector.js';
import { averageStudioDepth, transformStudioVertex } from './StudioThreeTransform.js';
import { studioLayerColor } from './StudioThreePalette.js';

/** Paint one canonical MODEL_3D layer as transformed, projected, depth-sorted geometry. */
export function paintStudioThreeMesh(context, layer, frame, viewport, camera) {
	const mesh = createStudioPrimitiveMesh(layer.content?.primitive);
	const transform = { scale: 1.15, y: 0.05, ...(layer.transform || {}) };
	const projected = mesh.vertices.map((vertex) => {
		const world = transformStudioVertex(vertex, transform);
		return projectStudioPoint(world, camera, viewport);
	});
	const faces = mesh.faces
		.map((indices, index) => createFace(indices, projected, index))
		.filter(Boolean)
		.sort((a, b) => b.depth - a.depth);
	context.save();
	faces.forEach((face) => paintFace(context, layer, face));
	context.restore();
}

function createFace(indices, projected, index) {
	const points = indices.map((vertexIndex) => projected[vertexIndex]);
	if (points.some((point) => !point)) return null;
	return { points, index, depth: averageStudioDepth(points) };
}

function paintFace(context, layer, face) {
	const first = face.points[0];
	context.beginPath();
	context.moveTo(first.x, first.y);
	for (const point of face.points.slice(1)) context.lineTo(point.x, point.y);
	context.closePath();
	context.fillStyle = studioLayerColor(layer, face.index * 21, 0.58, 46 + face.index * 3);
	context.strokeStyle = studioLayerColor(layer, face.index * 13 + 50, 0.88, 76);
	context.lineWidth = 1.4;
	context.fill();
	context.stroke();
}
