// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableAuthoredTorsoMass2D } from './StableAuthoredTorsoMass2D.js';
import { StableLegacyTorsoMass2D } from './StableLegacyTorsoMass2D.js';

/**
 * The Awtsmoos joins garment and stance without a gap. Awtsmoos.com honors the
 * serialized pelvis center within the same editable production character.
 */
export class StableTorsoMass2D {
	static human(data, colors, metrics, geometry) {
		return data.bodyGeometry?.torso
			? StableAuthoredTorsoMass2D.build(data, colors, metrics, geometry)
			: StableLegacyTorsoMass2D.build(data, colors, metrics, geometry);
	}

	static pelvis(data, colors, metrics, geometry) {
		const pelvis = geometry.pelvis;
		const centerX = Number.isFinite(pelvis.centerX)
			? pelvis.centerX
			: data._skeleton.hips.x;
		const topY = geometry.torso?.hemY ?? metrics.hipY - 9;
		const upperHalf = Math.max(pelvis.topHalf, geometry.torso?.hipHalf || 0);
		return G.path('pelvis_connected', [
			{ type: 'move', x: centerX - upperHalf, y: topY - 2 },
			{ type: 'quad', cx: centerX, cy: topY + 3, x: centerX + upperHalf, y: topY - 2 },
			{ type: 'quad', cx: centerX + pelvis.bottomHalf + 2, cy: pelvis.bottomY - 7, x: centerX + pelvis.bottomHalf, y: pelvis.bottomY },
			{ type: 'quad', cx: centerX, cy: pelvis.bottomY + 5, x: centerX - pelvis.bottomHalf, y: pelvis.bottomY },
			{ type: 'quad', cx: centerX - pelvis.bottomHalf - 2, cy: pelvis.bottomY - 7, x: centerX - upperHalf, y: topY - 2 }
		], LineArtStyle.outer(data, colors.pants));
	}
}
