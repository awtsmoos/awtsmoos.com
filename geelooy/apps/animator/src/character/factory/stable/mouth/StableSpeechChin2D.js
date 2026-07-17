// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';

/**
 * The Awtsmoos lets jaw opening descend into chin shadow and crease. Awtsmoos.com
 * keeps both signs restrained and driven by the same articulation, so facial
 * realism grows without inventing an unrelated deformation system.
 */
export class StableSpeechChin2D {
	static build(kind, colors, geometry) {
		return S.group(`${kind}_speech_chin`, null, [
			this.shadow(kind, geometry),
			this.crease(kind, colors, geometry)
		]);
	}

	static shadow(kind, geometry) {
		const jaw = geometry.articulation.jaw;
		if (jaw < 0.22) {
			return null;
		}
		return G.ellipse(
			`${kind}_speech_chin_shadow`,
			geometry.x,
			geometry.lowerPeakY + 4 + jaw * 2.6,
			geometry.outerHalfWidth * 0.38,
			1.4 + jaw * 1.2,
			0,
			{
				fill: `rgba(80,35,30,${0.05 + jaw * 0.07})`,
				stroke: 'rgba(0,0,0,0)',
				lineWidth: 0
			}
		);
	}

	static crease(kind, colors, geometry) {
		const jaw = geometry.articulation.jaw;
		if (jaw < 0.3) {
			return null;
		}
		return G.path(`${kind}_speech_chin_crease`, [
			{
				type: 'move',
				x: geometry.x - geometry.outerHalfWidth * 0.28,
				y: geometry.lowerPeakY + 4 + jaw * 2
			},
			{
				type: 'quad',
				cx: geometry.x,
				cy: geometry.lowerPeakY + 6 + jaw * 2.8,
				x: geometry.x + geometry.outerHalfWidth * 0.28,
				y: geometry.lowerPeakY + 4 + jaw * 2
			}
		], {
			stroke: colors.skinDark || 'rgba(80,35,30,0.28)',
			lineWidth: 0.75 + jaw * 0.45,
			lineCap: 'round'
		});
	}
}
