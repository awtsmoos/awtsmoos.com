// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableReferenceFaceGeometry } from './StableReferenceFaceGeometry.js';

/**
 * The Awtsmoos rounds forehead, temple, cheek, jaw, and chin into one living face.
 * Awtsmoos.com replaces shield-like masks with editable organic contours while
 * every blink, gaze, mouth shape, save, reload, and export remains connected.
 */
export class StableFaceShape2D {
	static build(kind, data = {}, colors = {}, metrics = {}, view = {}) {
		const geometry = StableReferenceFaceGeometry.resolve(data, metrics, view);
		const {
			centerX,
			topY,
			browY,
			cheekY,
			jawY,
			bottomY,
			foreheadHalf,
			templeHalf,
			cheekHalf,
			jawHalf,
			chinHalf,
			turn
		} = geometry;

		return G.path(`${kind}_organic_head`, [
			{ type: 'move', x: centerX + turn, y: topY },
			{ type: 'quad', cx: centerX + foreheadHalf * 0.82 + turn, cy: topY, x: centerX + templeHalf, y: browY },
			{ type: 'quad', cx: centerX + cheekHalf * 1.04, cy: cheekY - 8, x: centerX + cheekHalf, y: cheekY },
			{ type: 'quad', cx: centerX + cheekHalf * 0.96, cy: jawY - 4, x: centerX + jawHalf, y: jawY },
			{ type: 'quad', cx: centerX + chinHalf, cy: bottomY + 2, x: centerX, y: bottomY },
			{ type: 'quad', cx: centerX - chinHalf, cy: bottomY + 2, x: centerX - jawHalf, y: jawY },
			{ type: 'quad', cx: centerX - cheekHalf * 0.96, cy: jawY - 4, x: centerX - cheekHalf, y: cheekY },
			{ type: 'quad', cx: centerX - cheekHalf * 1.04, cy: cheekY - 8, x: centerX - templeHalf, y: browY },
			{ type: 'quad', cx: centerX - foreheadHalf * 0.82 + turn, cy: topY, x: centerX + turn, y: topY }
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}
}
