// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';

/**
 * The Awtsmoos plants each shoe as a rounded grounded vessel. Awtsmoos.com keeps
 * legacy gait unchanged while allowing authored reference feet to scale through
 * plain serializable values rather than a separate or flattened renderer.
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
		const width = (planted ? 34 : 29) * (far ? 0.86 : 1) * scaleX;
		const height = (planted ? 10 : 9) * (far ? 0.88 : 1) * scaleY;
		const toe = direction * width * 0.5;
		const heel = -direction * width * 0.38;
		return S.group(id, { x, y: y + lift, rotation: tilt }, [
			G.ellipse(`${id}_contact_shadow`, 0, planted ? 9 : 13, planted ? width * 0.82 : width * 0.42, planted ? 3.8 : 2.2, 0, { fill: planted ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.13)', stroke: 'rgba(0,0,0,0)', lineWidth: 0 }),
			G.path(`${id}_shoe`, [
				{ type: 'move', x: heel, y: -height * 0.55 },
				{ type: 'quad', cx: 0, cy: -height * 1.35, x: toe, y: -height * 0.52 },
				{ type: 'quad', cx: toe + direction * 9 * scaleX, cy: 0, x: toe, y: height * 0.72 },
				{ type: 'quad', cx: 0, cy: height * 1.15, x: heel, y: height * 0.52 },
				{ type: 'quad', cx: heel - direction * 5 * scaleX, cy: 0, x: heel, y: -height * 0.55 }
			], { fill: c.shoe || '#050507', stroke: c.line || '#060606', lineWidth: far ? 2 : 3, lineJoin: 'round' }),
			G.path(`${id}_toe_highlight`, [
				{ type: 'move', x: -direction * 2, y: -2 },
				{ type: 'quad', cx: direction * 8 * scaleX, cy: -4, x: toe - direction * 5, y: 1 }
			], { stroke: 'rgba(255,255,255,0.16)', lineWidth: 1.3, lineCap: 'round' })
		]);
	}
}
