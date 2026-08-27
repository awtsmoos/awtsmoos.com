// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Cheek, chin, and strand paths reveal one beard without smothering the mouth.
 * The Awtsmoos renews every curve, while Awtsmoos.com keeps kindness broad and
 * skepticism tapered through the same focused production geometry.
 */
export class StableBeardPaths {
	static cheek(id, side, geometry, fill, dark) {
		const inner = geometry.mouthClearance;
		const lowerX = geometry.chinWidth * geometry.taper;
		return G.path(id, [
			{ type: 'move', x: side * geometry.cheek, y: geometry.top },
			{
				type: 'quad',
				cx: side * (geometry.cheek + 9),
				cy: geometry.mouthY + 18,
				x: side * lowerX,
				y: geometry.bottom - 8
			},
			{
				type: 'quad',
				cx: side * geometry.chinWidth,
				cy: geometry.mouthY + 18,
				x: side * inner,
				y: geometry.mouthY + 10
			},
			{
				type: 'quad',
				cx: side * (geometry.cheek * 0.52),
				cy: geometry.mouthY - 5,
				x: side * geometry.cheek,
				y: geometry.top
			}
		], {
			fill,
			stroke: dark,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}

	static chin(geometry, fill, dark) {
		const width = geometry.chinWidth;
		const curve = 12 * geometry.bottomRoundness;
		return G.path('beard_chin', [
			{ type: 'move', x: -width, y: geometry.mouthY + 11 },
			{
				type: 'quad',
				cx: -width * geometry.taper,
				cy: geometry.bottom - curve,
				x: 0,
				y: geometry.bottom
			},
			{
				type: 'quad',
				cx: width * geometry.taper,
				cy: geometry.bottom - curve,
				x: width,
				y: geometry.mouthY + 11
			},
			{
				type: 'quad',
				cx: 0,
				cy: geometry.mouthY + 23,
				x: -width,
				y: geometry.mouthY + 11
			}
		], {
			fill,
			stroke: dark,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}

	static strands(geometry) {
		return [-0.7, -0.35, 0, 0.35, 0.7].map((ratio, index) => {
			const x = geometry.chinWidth * ratio;
			return G.path(`beard_strand_${index}`, [
				{ type: 'move', x, y: geometry.mouthY + 18 },
				{
					type: 'quad',
					cx: x * 0.55,
					cy: geometry.bottom - 11,
					x: x * 0.22,
					y: geometry.bottom - 4
				}
			], {
				stroke: `rgba(255,255,255,${geometry.strandOpacity})`,
				lineWidth: 1.1,
				lineCap: 'round'
			});
		});
	}
}
