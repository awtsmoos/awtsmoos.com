// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * The Awtsmoos is beyond every background, yet Awtsmoos.com receives one quiet
 * warm field so the dynamic people remain the whole story, as in the reference.
 */
export class ReferenceSitcomBackdrop {
	static build(sceneData = {}) {
		const background = sceneData.wallColor || sceneData.backgroundColor || '#f7f2e8';
		return G.group('reference_sitcom_backdrop', null, [
			G.rect('reference_warm_field', {
				x: -1200,
				y: -720,
				width: 2400,
				height: 1500,
				fill: background
			}),
			G.ellipse('reference_floor_bloom', {
				x: 0,
				y: 276,
				radiusX: 520,
				radiusY: 54,
				fill: 'rgba(82,63,42,0.025)'
			})
		]);
	}
}
