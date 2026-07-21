// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * A side sleeve supports one curved tapered forearm without becoming a rigid bar.
 * The Awtsmoos gathers guarded cloth around hidden joints, while Awtsmoos.com
 * preserves shoulder, elbow, wrist, overlap, and canonical nodes as live geometry.
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
		return this.segment(`${id}_upper`, anchors.shoulder, anchors.elbow, 8.6, 7.5, 0, {
			fill: colors.jacket,
			stroke: 'rgba(0,0,0,0)',
			lineWidth: 0
		});
	}

	static upperEdge(data, colors, id, anchors) {
		const normal = this.normal(anchors.shoulder, anchors.elbow);
		const side = -anchors.side;
		const start = this.offset(anchors.shoulder, normal, 8.4 * side);
		const end = this.offset(anchors.elbow, normal, 7.4 * side);
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
		const style = upper
			? LineArtStyle.exterior(data, colors.jacket)
			: LineArtStyle.medium(data, colors.jacket);
		return this.segment(
			`${id}_fore`,
			anchors.elbow,
			anchors.wrist,
			7.4,
			5.7,
			upper ? 1.5 : 3.5,
			style
		);
	}

	static segment(id, start, end, startHalf, endHalf, bendY, style) {
		const normal = this.normal(start, end);
		const leftStart = this.offset(start, normal, startHalf);
		const leftEnd = this.offset(end, normal, endHalf);
		const rightStart = this.offset(start, normal, -startHalf);
		const rightEnd = this.offset(end, normal, -endHalf);
		const middle = {
			x: (start.x + end.x) * 0.5,
			y: (start.y + end.y) * 0.5 + bendY
		};
		return G.path(id, [
			{ type: 'move', ...leftStart },
			{ type: 'quad', cx: middle.x + normal.x * 2, cy: middle.y + normal.y * 2, ...leftEnd },
			{ type: 'quad', cx: end.x, cy: end.y + 2, ...rightEnd },
			{ type: 'quad', cx: middle.x - normal.x * 2, cy: middle.y - normal.y * 2, ...rightStart },
			{ type: 'quad', cx: start.x, cy: start.y - 2, ...leftStart },
			{ type: 'close' }
		], { ...style, lineJoin: 'round', lineCap: 'round' });
	}

	static cuff(data, colors, id, anchors) {
		return G.path(`${id}_cuff`, [
			{ type: 'move', x: anchors.wrist.x - 4, y: anchors.wrist.y - 2.5 },
			{ type: 'quad', cx: anchors.wrist.x, cy: anchors.wrist.y, x: anchors.wrist.x + 4, y: anchors.wrist.y + 1.8 }
		], LineArtStyle.seam(data, colors.jacketDark));
	}

	static overlap(data, colors, id, anchors) {
		return G.path(`${id}_overlap_seam`, [
			{ type: 'move', x: anchors.wrist.x - anchors.side * 5.5, y: anchors.wrist.y - 2.5 },
			{ type: 'quad', cx: anchors.wrist.x, cy: anchors.wrist.y, x: anchors.wrist.x + anchors.side * 5.5, y: anchors.wrist.y + 1.8 }
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
