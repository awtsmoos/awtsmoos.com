// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';

/**
 * The Awtsmoos plants each shoe through heel, upper, toe, sole, and soft shadow.
 * Awtsmoos.com keeps stance, scale, lift, view depth, and foot tilt bound to the
 * editable character instead of flattening footwear into an oval.
 */
export class FootRenderer {
	static build(spec = {}) {
		const { id, x, y, side, c, view, leg, far } = spec;
		const direction = side < 0 ? -1 : 1;
		const planted = leg.planted === true;
		const lift = planted ? 0 : -5;
		const scaleX = Number(spec.scaleX || 1);
		const scaleY = Number(spec.scaleY || 1);
		const tilt = Number(leg.footTilt || 0)
			+ (far ? view.feet.farAngle : view.feet.nearAngle);
		const width = (planted ? 35 : 30) * (far ? 0.86 : 1) * scaleX;
		const height = (planted ? 13 : 10) * (far ? 0.9 : 1) * scaleY;
		const toe = direction * width * 0.52;
		const heel = -direction * width * 0.38;
		const fill = c.shoe || '#050507';
		const line = c.line || '#060606';

		return S.group(id, { x, y: y + lift, rotation: tilt }, [
			G.ellipse(
				`${id}_contact_shadow`,
				direction * width * 0.08,
				planted ? height * 0.92 : height * 1.2,
				planted ? width * 0.76 : width * 0.42,
				planted ? 3.6 : 2.2,
				0,
				{
					fill: planted ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.12)',
					stroke: 'rgba(0,0,0,0)',
					lineWidth: 0
				}
			),
			G.path(`${id}_shoe_upper`, [
				{ type: 'move', x: heel, y: height * 0.35 },
				{ type: 'quad', cx: heel - direction * width * 0.08, cy: -height * 0.45, x: heel + direction * width * 0.14, y: -height * 0.72 },
				{ type: 'quad', cx: direction * width * 0.1, cy: -height * 1.05, x: toe - direction * width * 0.08, y: -height * 0.5 },
				{ type: 'quad', cx: toe + direction * width * 0.16, cy: -height * 0.15, x: toe + direction * width * 0.11, y: height * 0.34 },
				{ type: 'quad', cx: direction * width * 0.12, cy: height * 0.72, x: heel, y: height * 0.35 }
			], {
				fill,
				stroke: line,
				lineWidth: far ? 2 : 2.7,
				lineJoin: 'round'
			}),
			G.path(`${id}_sole`, [
				{ type: 'move', x: heel - direction * width * 0.02, y: height * 0.45 },
				{ type: 'quad', cx: direction * width * 0.08, cy: height * 0.9, x: toe + direction * width * 0.09, y: height * 0.42 }
			], {
				stroke: line,
				lineWidth: far ? 2.1 : 3,
				lineCap: 'round'
			}),
			G.path(`${id}_upper_seam`, [
				{ type: 'move', x: heel + direction * width * 0.18, y: -height * 0.35 },
				{ type: 'quad', cx: direction * width * 0.08, cy: -height * 0.55, x: toe - direction * width * 0.22, y: -height * 0.22 }
			], {
				stroke: 'rgba(255,255,255,0.12)',
				lineWidth: 1.1,
				lineCap: 'round'
			})
		]);
	}
}
