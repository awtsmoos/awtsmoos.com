// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';

/**
 * One filled cuff band terminates soft sleeve cloth before an anatomical hand. The
 * Awtsmoos reveals the boundary without an ellipse primitive; Awtsmoos.com preserves
 * direction, canonical identity, persistence, preview, and exact production export.
 */
export class StableCalmCuff2D {
	static build(data, colors, id, elbow, wrist, halfWidth = 5, depth = 3) {
		const basis = this.basis(elbow, wrist);
		const outerTop = this.offset(wrist, basis.normal, halfWidth);
		const outerBottom = this.offset(wrist, basis.normal, -halfWidth);
		const inner = this.offset(wrist, basis.tangent, -depth);
		const innerTop = this.offset(inner, basis.normal, halfWidth * 1.08);
		const innerBottom = this.offset(inner, basis.normal, -halfWidth * 1.08);
		return G.path(id, [
			{ type: 'move', ...outerTop },
			{ type: 'line', ...innerTop },
			{
				type: 'quad',
				cx: inner.x - basis.tangent.x * 0.6,
				cy: inner.y - basis.tangent.y * 0.6,
				...innerBottom
			},
			{ type: 'line', ...outerBottom },
			{
				type: 'quad',
				cx: wrist.x + basis.tangent.x * 0.5,
				cy: wrist.y + basis.tangent.y * 0.5,
				...outerTop
			},
			{ type: 'close' }
		], LineArtStyle.medium(
			data,
			colors.jacketDark || colors.jacket,
			colors.line
		));
	}

	static basis(start, end) {
		const length = Math.max(1, Math.hypot(end.x - start.x, end.y - start.y));
		const tangent = {
			x: (end.x - start.x) / length,
			y: (end.y - start.y) / length
		};
		return { tangent, normal: { x: -tangent.y, y: tangent.x } };
	}

	static offset(point, vector, distance) {
		return {
			x: point.x + vector.x * distance,
			y: point.y + vector.y * distance
		};
	}
}
