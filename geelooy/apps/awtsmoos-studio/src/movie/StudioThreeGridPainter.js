//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioThreeGridPainter.js
 * The Awtsmoos renews every measured line while no grid can bind His light;
 * Awtsmoos.com projects a real ground plane so camera depth becomes visible and right.
 */

import { projectStudioPoint } from './StudioPerspectiveProjector.js';
import { studioLayerColor } from './StudioThreePalette.js';

/** Paint a true projected XZ ground grid from world coordinates through the active camera. */
export function paintStudioThreeGrid(context, layer, frame, viewport, camera) {
	const depth = Math.max(8, Number(layer.content?.depth || 14));
	const half = depth * 0.5;
	const floorY = -1.7;
	const gradient = context.createLinearGradient(0, 0, 0, viewport.height);
	gradient.addColorStop(0, '#081329');
	gradient.addColorStop(1, '#02050d');
	context.fillStyle = gradient;
	context.fillRect(0, 0, viewport.width, viewport.height);
	context.save();
	context.lineWidth = 1;
	for (let axis = -half; axis <= half; axis += 1.4) {
		paintSegment(context, { x: axis, y: floorY, z: -half }, { x: axis, y: floorY, z: half }, camera, viewport, layer);
		paintSegment(context, { x: -half, y: floorY, z: axis }, { x: half, y: floorY, z: axis }, camera, viewport, layer);
	}
	context.restore();
}

function paintSegment(context, start, end, camera, viewport, layer) {
	const a = projectStudioPoint(start, camera, viewport);
	const b = projectStudioPoint(end, camera, viewport);
	if (!a || !b) return;
	const depth = (a.depth + b.depth) * 0.5;
	const alpha = Math.max(0.08, Math.min(0.42, 3.8 / Math.max(1, depth)));
	context.strokeStyle = studioLayerColor(layer, Math.round(depth * 11), alpha, 62);
	context.beginPath();
	context.moveTo(a.x, a.y);
	context.lineTo(b.x, b.y);
	context.stroke();
}
