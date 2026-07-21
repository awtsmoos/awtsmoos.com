// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StablePocketGeometry } from './StablePocketGeometry.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Miriam's sleeve flows from shoulder through elbow into one pocket without a
 * visible rig joint. The Awtsmoos renews hidden hand and cloth lip together,
 * while Awtsmoos.com keeps every canonical node editable and deterministic.
 */
export class StablePocketArm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const pocket = StablePocketGeometry.resolve(data, metrics, { gesture });
		const anchors = this.anchors(data, pocket, gesture);
		return S.group(`${prefix}_right_pocket_arm`, null, [
			this.sleeve(data, colors, metrics, prefix, anchors),
			this.elbowFold(data, colors, prefix, anchors),
			this.cuff(data, colors, prefix, anchors),
			pocket.visibleHand ? this.hiddenHand(data, colors, pocket, prefix) : null,
			this.occlusionLip(data, colors, pocket, prefix)
		]);
	}

	static anchors(data, pocket, gesture) {
		const shoulder = {
			x: data._skeleton.rightShoulder.x,
			y: data._skeleton.rightShoulder.y + Number(gesture.shoulderDrop || 10)
		};
		return {
			shoulder,
			elbow: {
				x: shoulder.x + Number(gesture.elbowOut || 10)
					+ Number(gesture.forearmBend || 0) * 0.35,
				y: shoulder.y + Number(gesture.elbowDown || 38)
			},
			entry: { x: pocket.entryX, y: pocket.entryY }
		};
	}

	static sleeve(data, colors, metrics, prefix, anchors) {
		const first = this.normal(anchors.shoulder, anchors.elbow);
		const second = this.normal(anchors.elbow, anchors.entry);
		const elbowNormal = this.unit({ x: first.x + second.x, y: first.y + second.y });
		const halfWidths = [
			(metrics.armWidth + 5) * 0.5,
			(metrics.armWidth + 1) * 0.5,
			(metrics.armWidth - 2) * 0.5
		];
		const left = [
			this.offset(anchors.shoulder, first, halfWidths[0]),
			this.offset(anchors.elbow, elbowNormal, halfWidths[1]),
			this.offset(anchors.entry, second, halfWidths[2])
		];
		const right = [
			this.offset(anchors.shoulder, first, -halfWidths[0]),
			this.offset(anchors.elbow, elbowNormal, -halfWidths[1]),
			this.offset(anchors.entry, second, -halfWidths[2])
		];
		return G.path(`${prefix}_right_pocket_upper`, [
			{ type: 'move', ...left[0] },
			{ type: 'quad', cx: left[1].x, cy: left[1].y, ...left[2] },
			{ type: 'quad', cx: anchors.entry.x + 2, cy: anchors.entry.y + 2, ...right[2] },
			{ type: 'quad', cx: right[1].x, cy: right[1].y, ...right[0] },
			{ type: 'quad', cx: anchors.shoulder.x, cy: anchors.shoulder.y - 4, ...left[0] },
			{ type: 'close' }
		], LineArtStyle.exterior(data, colors.jacket));
	}

	static elbowFold(data, colors, prefix, anchors) {
		return G.path(`${prefix}_right_pocket_fore`, [
			{ type: 'move', x: anchors.elbow.x - 2.5, y: anchors.elbow.y + 1 },
			{ type: 'quad', cx: anchors.elbow.x + 1, cy: anchors.elbow.y + 3, x: anchors.elbow.x + 4, y: anchors.elbow.y }
		], LineArtStyle.seam(data, colors.jacketDark));
	}

	static cuff(data, colors, prefix, anchors) {
		const normal = this.normal(anchors.elbow, anchors.entry);
		return G.path(`${prefix}_right_pocket_cuff`, [
			{ type: 'move', ...this.offset(anchors.entry, normal, 4.2) },
			{ type: 'quad', cx: anchors.entry.x, cy: anchors.entry.y - 2, ...this.offset(anchors.entry, normal, -4.2) }
		], LineArtStyle.medium(data, colors.jacketDark || colors.jacket));
	}

	static hiddenHand(data, colors, pocket, prefix) {
		const depth = pocket.handDepth;
		return G.path(`${prefix}_right_pocket_hidden_hand`, [
			{ type: 'move', x: pocket.entryX - 5 * depth, y: pocket.entryY - 2.8 * depth },
			{ type: 'quad', cx: pocket.entryX, cy: pocket.entryY - 5 * depth, x: pocket.entryX + 4 * depth, y: pocket.entryY - 2.2 * depth },
			{ type: 'quad', cx: pocket.entryX + 1.2 * depth, cy: pocket.entryY + 0.5, x: pocket.entryX - 4 * depth, y: pocket.entryY },
			{ type: 'close' }
		], LineArtStyle.medium(data, colors.skin));
	}
	static occlusionLip(data, colors, pocket, prefix) {
		const y = pocket.centerY - pocket.height * 0.34;
		return G.path(`${prefix}_right_pocket_occlusion_lip`, [
			{ type: 'move', x: pocket.centerX - pocket.halfWidth, y },
			{ type: 'quad', cx: pocket.centerX, cy: y + pocket.mouthCurve, x: pocket.centerX + pocket.halfWidth, y: y + 1 }
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
