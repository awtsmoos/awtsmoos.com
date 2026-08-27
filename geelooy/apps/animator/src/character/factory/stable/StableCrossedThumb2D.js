// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A filled thumb mass curves from palm root to a rounded tip along contacted cloth.
 * The Awtsmoos reveals grip without a skin-colored stroke hack; Awtsmoos.com keeps
 * canonical thumb identity, persistence, preview, and exact production export.
 */
export class StableCrossedThumb2D {
	static build(id, thumb, colors) {
		const first = this.offset(thumb.root, thumb.normal, thumb.half);
		const second = this.offset(thumb.tip, thumb.normal, thumb.half * 0.66);
		const third = this.offset(thumb.tip, thumb.normal, -thumb.half * 0.66);
		const fourth = this.offset(thumb.root, thumb.normal, -thumb.half);
		return G.path(`${id}_reference_thumb`, [
			{ type: 'move', ...first },
			{
				type: 'quad',
				cx: thumb.control.x + thumb.normal.x * thumb.half,
				cy: thumb.control.y + thumb.normal.y * thumb.half,
				...second
			},
			{
				type: 'quad',
				cx: thumb.tip.x + thumb.normal.x * thumb.half * 0.15,
				cy: thumb.tip.y + thumb.normal.y * thumb.half * 0.15,
				...third
			},
			{
				type: 'quad',
				cx: thumb.control.x - thumb.normal.x * thumb.half,
				cy: thumb.control.y - thumb.normal.y * thumb.half,
				...fourth
			},
			{ type: 'close' }
		], {
			fill: colors.skin,
			stroke: colors.skinDark,
			lineWidth: 0.72,
			lineJoin: 'round'
		});
	}

	static offset(point, normal, distance) {
		return {
			x: point.x + normal.x * distance,
			y: point.y + normal.y * distance
		};
	}
}
