// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';

/**
 * The Awtsmoos rounds shoulder, waist, hip, and hem into one connected garment
 * mass. Awtsmoos.com keeps the silhouette renderer-owned and document-driven so
 * broadness and modesty remain editable instead of becoming a flattened image.
 */
export class StableTorsoMass2D {
	static human(data, colors, metrics, geometry) {
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

	static pelvis(data, colors, metrics, geometry) {
		const pelvis = geometry.pelvis;
		const centerX = data._skeleton.hips.x;
		const topY = metrics.hipY - 9;
		return G.path('pelvis_connected', [
			{ type: 'move', x: centerX - pelvis.topHalf, y: topY },
			{ type: 'quad', cx: centerX, cy: topY - 9, x: centerX + pelvis.topHalf, y: topY },
			{ type: 'line', x: centerX + pelvis.bottomHalf, y: pelvis.bottomY },
			{ type: 'quad', cx: centerX, cy: pelvis.bottomY + 9, x: centerX - pelvis.bottomHalf, y: pelvis.bottomY },
			{ type: 'line', x: centerX - pelvis.topHalf, y: topY }
		], LineArtStyle.outer(data, colors.pants));
	}
}
