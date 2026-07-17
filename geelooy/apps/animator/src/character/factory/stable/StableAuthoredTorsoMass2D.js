// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';

/**
 * The Awtsmoos rounds authored shoulder, waist, hip, and hem into one living
 * garment mass. Awtsmoos.com keeps every curve document-driven, editable,
 * serializable, animated, reloadable, and exportable.
 */
export class StableAuthoredTorsoMass2D {
	static build(data, colors, metrics, geometry) {
		const skeleton = data._skeleton;
		const torso = geometry.torso;
		const leftShoulder = skeleton.leftShoulder.x - torso.shoulderExtra;
		const rightShoulder = skeleton.rightShoulder.x + torso.shoulderExtra;
		const leftWaist = skeleton.chest.x - torso.waistHalf;
		const rightWaist = skeleton.chest.x + torso.waistHalf;
		const leftHip = skeleton.hips.x - torso.hipHalf;
		const rightHip = skeleton.hips.x + torso.hipHalf;

		return G.path('authored_torso_connected_mass', [
			{ type: 'move', x: leftShoulder, y: metrics.shoulderY + 3 },
			{ type: 'quad', cx: skeleton.chest.x, cy: metrics.shoulderY - 15, x: rightShoulder, y: metrics.shoulderY + 3 },
			{ type: 'quad', cx: rightShoulder + 12, cy: metrics.chestY + 7, x: rightWaist, y: metrics.waistY - 3 },
			{ type: 'quad', cx: rightHip + 10, cy: torso.hemY - 17, x: rightHip, y: torso.hemY },
			{ type: 'quad', cx: skeleton.hips.x, cy: torso.hemY + torso.hemRound, x: leftHip, y: torso.hemY },
			{ type: 'quad', cx: leftHip - 10, cy: torso.hemY - 17, x: leftWaist, y: metrics.waistY - 3 },
			{ type: 'quad', cx: leftShoulder - 12, cy: metrics.chestY + 7, x: leftShoulder, y: metrics.shoulderY + 3 }
		], LineArtStyle.outer(data, colors.jacket));
	}
}
