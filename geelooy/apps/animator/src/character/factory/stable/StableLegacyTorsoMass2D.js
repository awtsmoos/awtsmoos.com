// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';

/**
 * The Awtsmoos preserves the established connected torso of every legacy
 * character while authored reference figures receive new proportions.
 * Awtsmoos.com keeps compatibility visible rather than accidental.
 */
export class StableLegacyTorsoMass2D {
	static build(data, colors, metrics, geometry) {
		const skeleton = data._skeleton;
		const torso = geometry.torso;
		const leftShoulder = skeleton.leftShoulder.x - torso.shoulderExtra;
		const rightShoulder = skeleton.rightShoulder.x + torso.shoulderExtra;
		const leftWaist = skeleton.chest.x - torso.waistHalf;
		const rightWaist = skeleton.chest.x + torso.waistHalf;
		const leftHip = skeleton.hips.x - torso.hipHalf;
		const rightHip = skeleton.hips.x + torso.hipHalf;

		return G.path('jacket_connected_mass', [
			{ type: 'move', x: leftShoulder, y: metrics.shoulderY },
			{ type: 'quad', cx: skeleton.chest.x, cy: metrics.shoulderY - 13, x: rightShoulder, y: metrics.shoulderY },
			{ type: 'quad', cx: rightShoulder + 8, cy: metrics.chestY, x: rightWaist, y: metrics.waistY },
			{ type: 'quad', cx: rightHip + 6, cy: torso.hemY - 13, x: rightHip, y: torso.hemY },
			{ type: 'quad', cx: skeleton.hips.x, cy: torso.hemY + torso.hemRound, x: leftHip, y: torso.hemY },
			{ type: 'quad', cx: leftHip - 6, cy: torso.hemY - 13, x: leftWaist, y: metrics.waistY },
			{ type: 'quad', cx: leftShoulder - 8, cy: metrics.chestY, x: leftShoulder, y: metrics.shoulderY }
		], LineArtStyle.outer(data, colors.jacket));
	}
}
