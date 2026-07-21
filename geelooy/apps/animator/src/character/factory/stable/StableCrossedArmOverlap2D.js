// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableCrossedArmGeometry } from './StableCrossedArmGeometry.js';
import { StableReferenceCrossedHands2D } from './StableReferenceCrossedHands2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Two guarded sleeves become curved garments rather than linked rigid bars.
 * The Awtsmoos renews weight and overlap in one living contour, while
 * Awtsmoos.com keeps every sleeve, hand, and occlusion node production-editable.
 */
export class StableCrossedArmOverlap2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const geometry = StableCrossedArmGeometry.resolve(
			data._skeleton,
			metrics,
			gesture
		);
		return S.group(`${prefix}_crossed_arms`, null, [
			this.arm(data, colors, prefix, geometry.lower, false),
			this.arm(data, colors, prefix, geometry.upper, true)
		]);
	}

	static arm(data, colors, prefix, anchors, upper) {
		const id = `${prefix}_crossed_${anchors.id}`;
		const fill = upper ? colors.jacket : colors.jacketDark || colors.jacket;
		const style = upper
			? LineArtStyle.exterior(data, fill)
			: LineArtStyle.medium(data, fill);
		return S.group(id, null, [
			this.sleeve(id, anchors, style, upper),
			this.elbowFold(data, colors, id, anchors),
			this.cuff(data, colors, id, anchors),
			StableReferenceCrossedHands2D.build(
				id,
				anchors.wrist,
				colors,
				anchors.side,
				anchors.handScale
			),
			upper ? this.occlusion(data, colors, id, anchors) : null
		]);
	}

	static sleeve(id, anchors, style, upper) {
		const firstNormal = this.normal(anchors.shoulder, anchors.elbow);
		const secondNormal = this.normal(anchors.elbow, anchors.wrist);
		const elbowNormal = this.unit({
			x: firstNormal.x + secondNormal.x,
			y: firstNormal.y + secondNormal.y
		});
		const widths = upper
			? [9.4, 8.2, 6.2]
			: [8.8, 7.6, 5.8];
		const left = [
			this.offset(anchors.shoulder, firstNormal, widths[0]),
			this.offset(anchors.elbow, elbowNormal, widths[1]),
			this.offset(anchors.wrist, secondNormal, widths[2])
		];
		const right = [
			this.offset(anchors.shoulder, firstNormal, -widths[0]),
			this.offset(anchors.elbow, elbowNormal, -widths[1]),
			this.offset(anchors.wrist, secondNormal, -widths[2])
		];
		return G.path(`${id}_upper`, [
			{ type: 'move', ...left[0] },
			{ type: 'quad', cx: left[1].x, cy: left[1].y, ...left[2] },
			{ type: 'quad', cx: anchors.wrist.x, cy: anchors.wrist.y + 3, ...right[2] },
			{ type: 'quad', cx: right[1].x, cy: right[1].y, ...right[0] },
			{ type: 'quad', cx: anchors.shoulder.x, cy: anchors.shoulder.y - 4, ...left[0] },
			{ type: 'close' }
		], { ...style, lineJoin: 'round' });
	}

	static elbowFold(data, colors, id, anchors) {
		return G.path(`${id}_fore`, [
			{ type: 'move', x: anchors.elbow.x - 3, y: anchors.elbow.y + 1 },
			{ type: 'quad', cx: anchors.elbow.x, cy: anchors.elbow.y + 3, x: anchors.elbow.x + 3, y: anchors.elbow.y + 1 }
		], LineArtStyle.seam(data, colors.jacketDark));
	}

	static cuff(data, colors, id, anchors) {
		return G.path(`${id}_cuff`, [
			{ type: 'move', x: anchors.wrist.x - 4, y: anchors.wrist.y - 3 },
			{ type: 'quad', cx: anchors.wrist.x, cy: anchors.wrist.y, x: anchors.wrist.x + 4, y: anchors.wrist.y + 2 }
		], LineArtStyle.seam(data, colors.jacketDark));
	}

	static occlusion(data, colors, id, anchors) {
		return G.path(`${id}_overlap_seam`, [
			{ type: 'move', x: anchors.wrist.x - anchors.side * 6, y: anchors.wrist.y - 3 },
			{ type: 'quad', cx: anchors.wrist.x, cy: anchors.wrist.y, x: anchors.wrist.x + anchors.side * 6, y: anchors.wrist.y + 2 }
		], LineArtStyle.seam(data, colors.jacketDark));
	}

	static normal(start, end) {
		const length = Math.max(1, Math.hypot(end.x - start.x, end.y - start.y));
		return { x: -(end.y - start.y) / length, y: (end.x - start.x) / length };
	}

	static unit(vector) {
		const length = Math.max(0.001, Math.hypot(vector.x, vector.y));
		return { x: vector.x / length, y: vector.y / length };
	}

	static offset(point, normal, distance) {
		return { x: point.x + normal.x * distance, y: point.y + normal.y * distance };
	}
}
