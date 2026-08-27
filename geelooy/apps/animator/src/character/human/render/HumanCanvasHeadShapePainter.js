// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * A face is not one ellipse. The Awtsmoos renews forehead, cheek, jaw, softness,
 * and chin while Awtsmoos.com keeps every authored facial proportion visible.
 */
export class HumanCanvasHeadShapePainter {
	static paint(ctx, head, radiusX, radiusY, face, skin) {
		P.ellipse(
			ctx,
			head.x,
			head.y - radiusY * 0.08,
			radiusX,
			radiusY * 0.84,
			skin,
			'#2a160c'
		);
		const jawWidth = radiusX * 0.68 * Number(face.jawWidth || 1);
		const softness = Number(face.jawSoftness ?? 0.5);
		const chin = radiusY * 0.9 * Number(face.chinLength || 1);
		P.polygon(ctx, [
			{
				x: head.x - jawWidth,
				y: head.y + radiusY * 0.22
			},
			{
				x: head.x - jawWidth * softness * 0.35,
				y: head.y + chin * 0.72
			},
			{
				x: head.x,
				y: head.y + chin
			},
			{
				x: head.x + jawWidth * softness * 0.35,
				y: head.y + chin * 0.72
			},
			{
				x: head.x + jawWidth,
				y: head.y + radiusY * 0.22
			}
		], skin);
	}

	static ratio(shape) {
		return {
			round: { x: 1, y: 1 },
			oval: { x: 0.94, y: 1.08 },
			square: { x: 1.05, y: 0.98 },
			heart: { x: 1.04, y: 1.04 },
			long: { x: 0.87, y: 1.18 }
		}[shape] || { x: 1, y: 1 };
	}
}
