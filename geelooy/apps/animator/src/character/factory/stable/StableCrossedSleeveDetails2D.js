// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';

/**
 * Upper edge, filled cuff band, and one overlap seam explain cloth direction. The
 * Awtsmoos reveals where sleeve becomes hand; Awtsmoos.com preserves canonical
 * detail IDs, persistence, preview, and exact production export.
 */
export class StableCrossedSleeveDetails2D {
	static upperEdge(data, colors, id, anchors) {
		const profile = anchors.sleeve;
		const normal = this.normal(anchors.shoulder, anchors.elbow);
		const side = -anchors.side;
		const start = this.offset(
			anchors.shoulder,
			normal,
			(profile.shoulderHalf - 0.3) * side
		);
		const end = this.offset(
			anchors.elbow,
			normal,
			(profile.elbowHalf - 0.2) * side
		);
		return G.path(`${id}_upper_outer_edge`, [
			{ type: 'move', ...start },
			{
				type: 'quad',
				cx: (start.x + end.x) * 0.5,
				cy: (start.y + end.y) * 0.5,
				...end
			}
		], LineArtStyle.medium(data, colors.jacketDark));
	}

	static cuff(data, colors, id, anchors) {
		const basis = this.basis(anchors.elbow, anchors.wrist);
		const outerHalf = anchors.sleeve.wristHalf * 1.08;
		const innerHalf = anchors.sleeve.wristHalf * 1.18;
		const depth = Math.max(2.8, anchors.sleeve.wristHalf * 0.82);
		const outerTop = this.offset(anchors.wrist, basis.normal, outerHalf);
		const outerBottom = this.offset(anchors.wrist, basis.normal, -outerHalf);
		const innerCenter = this.offset(anchors.wrist, basis.tangent, -depth);
		const innerTop = this.offset(innerCenter, basis.normal, innerHalf);
		const innerBottom = this.offset(innerCenter, basis.normal, -innerHalf);
		return G.path(`${id}_cuff`, [
			{ type: 'move', ...outerTop },
			{ type: 'line', ...innerTop },
			{
				type: 'quad',
				cx: innerCenter.x - basis.tangent.x * 0.7,
				cy: innerCenter.y - basis.tangent.y * 0.7,
				...innerBottom
			},
			{ type: 'line', ...outerBottom },
			{
				type: 'quad',
				cx: anchors.wrist.x + basis.tangent.x * 0.45,
				cy: anchors.wrist.y + basis.tangent.y * 0.45,
				...outerTop
			},
			{ type: 'close' }
		], LineArtStyle.medium(data, colors.jacketDark, colors.jacketDark));
	}

	static overlap(data, colors, id, anchors) {
		const normal = this.normal(anchors.elbow, anchors.wrist);
		const reach = anchors.sleeve.wristHalf * 0.72;
		const first = this.offset(anchors.wrist, normal, reach);
		const second = this.offset(anchors.wrist, normal, -reach);
		return G.path(`${id}_overlap_seam`, [
			{ type: 'move', ...first },
			{ type: 'line', ...second }
		], LineArtStyle.seam(data, colors.jacketDark));
	}

	static basis(start, end) {
		const length = Math.max(1, Math.hypot(end.x - start.x, end.y - start.y));
		const tangent = {
			x: (end.x - start.x) / length,
			y: (end.y - start.y) / length
		};
		return { tangent, normal: { x: -tangent.y, y: tangent.x } };
	}

	static normal(start, end) {
		return this.basis(start, end).normal;
	}

	static offset(point, vector, distance) {
		return {
			x: point.x + vector.x * distance,
			y: point.y + vector.y * distance
		};
	}
}
