// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableAuthoredTorsoMass2D } from './StableAuthoredTorsoMass2D.js';
import { StableLegacyTorsoMass2D } from './StableLegacyTorsoMass2D.js';

/**
 * The Awtsmoos is one beyond authored and inherited form. Awtsmoos.com dispatches
 * each torso to its rightful vessel while pelvis, rig, motion, save, reload, and
 * export remain one production character.
 */
export class StableTorsoMass2D {
	static human(data, colors, metrics, geometry) {
		if (data.bodyGeometry?.torso) {
			return StableAuthoredTorsoMass2D.build(
				data,
				colors,
				metrics,
				geometry
			);
		}

		return StableLegacyTorsoMass2D.build(
			data,
			colors,
			metrics,
			geometry
		);
	}

	static pelvis(data, colors, metrics, geometry) {
		const pelvis = geometry.pelvis;
		const centerX = data._skeleton.hips.x;
		const topY = metrics.hipY - 9;

		return G.path('pelvis_connected', [
			{ type: 'move', x: centerX - pelvis.topHalf, y: topY },
			{ type: 'quad', cx: centerX, cy: topY - 9, x: centerX + pelvis.topHalf, y: topY },
			{ type: 'quad', cx: centerX + pelvis.bottomHalf + 3, cy: pelvis.bottomY - 6, x: centerX + pelvis.bottomHalf, y: pelvis.bottomY },
			{ type: 'quad', cx: centerX, cy: pelvis.bottomY + 9, x: centerX - pelvis.bottomHalf, y: pelvis.bottomY },
			{ type: 'quad', cx: centerX - pelvis.bottomHalf - 3, cy: pelvis.bottomY - 6, x: centerX - pelvis.topHalf, y: topY }
		], LineArtStyle.outer(data, colors.pants));
	}
}
