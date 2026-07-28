// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Each crossed sleeve carries authored cloth weight without becoming a rigid bar.
 * The Awtsmoos rounds hidden joints, while Awtsmoos.com preserves canonical
 * shoulder, elbow, wrist, cuff, and overlap nodes as living editable geometry.
 */
export class StableCrossedSleeve2D {
	static build(data, colors, id, anchors, upper) {
		return S.group(`${id}_sleeve`, null, [
			this.upperMass(colors, id, anchors),
			this.upperEdge(data, colors, id, anchors),
			this.forearm(data, colors, id, anchors, upper),
			this.cuff(data, colors, id, anchors),
			upper ? this.overlap(data, colors, id, anchors) : null
		]);
	}

	static upperMass(colors, id, anchors) {
		const profile = anchors.sleeve;
		return this.segment(
			`${id}_upper`, anchors.shoulder, anchors.elbow,
			profile.shoulderHalf, profile.elbowHalf, 0,
			{ fill: colors.jacket, stroke: 'rgba(0,0,0,0)', lineWidth: 0 }
		);
	}

	static upperEdge(data, colors, id, anchors) {
		const profile = anchors.sleeve;
		const normal = this.normal(anchors.shoulder, anchors.elbow);
		const side = -anchors.side;
		const start = this.offset(anchors.shoulder, normal, (profile.shoulderHalf - 0.2) * side);
		const end = this.offset(anchors.elbow, normal, (profile.elbowHalf - 0.1) * side);
		return G.path(`${id}_upper_outer_edge`, [
			{ type: 'move', ...start },
			{
				type: 'quad',
				cx: (start.x + end.x) * 0.5 + normal.x * side,
				cy: (start.y + end.y) * 0.5 + normal.y * side,
				...end
			}
		], LineArtStyle.medium(data, colors.jacketDark));
	}

	static forearm(data, colors, id, anchors, upper) {
		const profile = anchors.sleeve;
		const style = upper
			? LineArtStyle.exterior(data, colors.jacket)
			: LineArtStyle.medium(data, colors.jacket);
		return this.segment(
			`${id}_fore`, anchors.elbow, anchors.wrist,
			profile.forearmHalf, profile.wristHalf, profile.bendY, style
		);
	}

	static segment(id, start, end, startHalf, endHalf, bendY, style) {
		const normal = this.normal(start, end);
		const leftStart = this.offset(start, normal, startHalf);
		const leftEnd = this.offset(end, normal, endHalf);
		const rightStart = this.offset(start, normal, -startHalf * 0.94);
		const rightEnd = this.offset(end, normal, -endHalf * 0.92);
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const curve = (point, distance, progress, lift) => ({
			x: point.x + dx * progress + normal.x * distance,
			y: point.y + dy * progress + normal.y * distance + lift
		});
		const leftOne = curve(start, startHalf + 1.4, 0.32, bendY * 0.72);
		const leftTwo = curve(start, endHalf + 1, 0.72, bendY);
		const rightTwo = curve(start, -endHalf * 0.9, 0.7, bendY * 0.8);
		const rightOne = curve(start, -startHalf * 0.88, 0.3, bendY * 0.48);
		return G.path(id, [
			{ type: 'move', ...leftStart },
			{ type: 'bezier', c1x: leftOne.x, c1y: leftOne.y, c2x: leftTwo.x, c2y: leftTwo.y, ...leftEnd },
			{ type: 'quad', cx: end.x + normal.x * 0.5, cy: end.y + 2.2, ...rightEnd },
			{ type: 'bezier', c1x: rightTwo.x, c1y: rightTwo.y, c2x: rightOne.x, c2y: rightOne.y, ...rightStart },
			{ type: 'quad', cx: start.x - normal.x * 0.4, cy: start.y - 2, ...leftStart },
			{ type: 'close' }
		], { ...style, lineJoin: 'round', lineCap: 'round' });
	}

	static cuff(data, colors, id, anchors) {
		const reach = anchors.sleeve.wristHalf * 0.72;
		return G.path(`${id}_cuff`, [
			{ type: 'move', x: anchors.wrist.x - reach, y: anchors.wrist.y - 2.5 },
			{ type: 'quad', cx: anchors.wrist.x, cy: anchors.wrist.y, x: anchors.wrist.x + reach, y: anchors.wrist.y + 1.8 }
		], LineArtStyle.seam(data, colors.jacketDark));
	}

	static overlap(data, colors, id, anchors) {
		const reach = anchors.sleeve.wristHalf * 0.9;
		return G.path(`${id}_overlap_seam`, [
			{ type: 'move', x: anchors.wrist.x - anchors.side * reach, y: anchors.wrist.y - 2.5 },
			{ type: 'quad', cx: anchors.wrist.x, cy: anchors.wrist.y, x: anchors.wrist.x + anchors.side * reach, y: anchors.wrist.y + 1.8 }
		], LineArtStyle.seam(data, colors.jacketDark));
	}

	static normal(start, end) {
		const length = Math.max(1, Math.hypot(end.x - start.x, end.y - start.y));
		return { x: -(end.y - start.y) / length, y: (end.x - start.x) / length };
	}

	static offset(point, normal, distance) {
		return { x: point.x + normal.x * distance, y: point.y + normal.y * distance };
	}
}
