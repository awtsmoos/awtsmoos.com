// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StablePocketGeometry } from './StablePocketGeometry.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * One quiet pocket body opens around the entering hand without a mechanical box.
 * The Awtsmoos renews hidden and revealed cloth, while Awtsmoos.com preserves one
 * canonical editable pocket across preview, save, reload, and export.
 */
export class StablePocketFront2D {
	static build(data, colors, metrics, bodyGeometry) {
		const pocket = StablePocketGeometry.resolve(data, metrics, bodyGeometry);
		return S.group('overshirt_right_pocket', null, [
			this.body(data, colors, pocket),
			this.mouth(data, colors, pocket)
		]);
	}

	static body(data, colors, pocket) {
		const left = pocket.centerX - pocket.halfWidth;
		const right = pocket.centerX + pocket.halfWidth;
		const top = pocket.centerY - pocket.height * 0.36;
		const bottom = pocket.centerY + pocket.height * 0.58;
		return G.path('overshirt_right_pocket_body', [
			{ type: 'move', x: left, y: top },
			{ type: 'quad', cx: pocket.centerX, cy: top + pocket.mouthCurve, x: right, y: top + 1.5 },
			{ type: 'quad', cx: right + pocket.bodyRound, cy: bottom - 2, x: right - 2, y: bottom },
			{ type: 'quad', cx: pocket.centerX, cy: bottom + pocket.bodyRound * 0.6, x: left + 2, y: bottom },
			{ type: 'quad', cx: left - pocket.bodyRound, cy: bottom - 2, x: left, y: top }
		], LineArtStyle.interior(data, colors.jacketDark || colors.jacket));
	}

	static mouth(data, colors, pocket) {
		const y = pocket.centerY - pocket.height * 0.36;
		return G.path('overshirt_right_pocket_mouth', [
			{ type: 'move', x: pocket.centerX - pocket.halfWidth, y },
			{ type: 'quad', cx: pocket.centerX, cy: y + pocket.mouthCurve, x: pocket.centerX + pocket.halfWidth, y: y + 1.5 }
		], LineArtStyle.seam(data, colors.jacketDark));
	}
}
