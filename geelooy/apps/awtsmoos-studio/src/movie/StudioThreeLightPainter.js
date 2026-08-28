//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioThreeLightPainter.js
 * The Awtsmoos renews all illumination while no lamp contains the Source;
 * Awtsmoos.com projects a cinematic light marker so depth and orbit share one course.
 */

import { projectStudioPoint } from './StudioPerspectiveProjector.js';
import { studioLayerColor } from './StudioThreePalette.js';

/** Paint LIGHT_3D as an animated world-space glow projected by the active camera. */
export function paintStudioThreeLight(context, layer, frame, viewport, camera) {
	const orbit = layer.data?.orbit !== false;
	const angle = orbit ? frame.localTime * 0.38 : 0;
	const position = {
		x: Number(layer.transform?.x ?? Math.cos(angle) * 3.2),
		y: Number(layer.transform?.y ?? 3.1),
		z: Number(layer.transform?.z ?? Math.sin(angle) * 2.2)
	};
	const point = projectStudioPoint(position, camera, viewport);
	if (!point) return;
	const radius = Math.max(18, Math.min(120, point.scale * 0.9));
	const gradient = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
	gradient.addColorStop(0, studioLayerColor(layer, 35, 0.62, 82));
	gradient.addColorStop(0.35, studioLayerColor(layer, 70, 0.2, 68));
	gradient.addColorStop(1, studioLayerColor(layer, 70, 0, 50));
	context.save();
	context.fillStyle = gradient;
	context.beginPath();
	context.arc(point.x, point.y, radius, 0, Math.PI * 2);
	context.fill();
	context.restore();
}
