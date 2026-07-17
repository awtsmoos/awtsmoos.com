// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';

/**
 * The Awtsmoos rounds authored shoulder, chest, waist, hip, and hem into one soft
 * garment mass. Awtsmoos.com keeps every contour document-driven so television-
 * cartoon weight survives editing, animation, save, reload, and export.
 */
export class StableAuthoredTorsoMass2D {
	static build(data, colors, metrics, geometry) {
		const skeleton = data._skeleton;
		const torso = geometry.torso;
		const centerX = skeleton.chest.x;
		const leftShoulder = skeleton.leftShoulder.x - torso.shoulderExtra;
		const rightShoulder = skeleton.rightShoulder.x + torso.shoulderExtra;
		const leftWaist = centerX - torso.waistHalf;
		const rightWaist = centerX + torso.waistHalf;
		const leftHip = skeleton.hips.x - torso.hipHalf;
		const rightHip = skeleton.hips.x + torso.hipHalf;
		const shoulderY = metrics.shoulderY + Number(torso.shoulderDrop || 4);
		const waistY = metrics.waistY + Number(torso.waistDrop || 0);
		const sideRound = Number(torso.sideRound || 12);
		const belly = Number(torso.belly || 0);
		const hemLift = Number(torso.hemLift || 0);

		return G.path('authored_torso_connected_mass', [
			{ type: 'move', x: leftShoulder, y: shoulderY },
			{
				type: 'quad',
				cx: centerX,
				cy: shoulderY - Number(torso.shoulderArch || 13),
				x: rightShoulder,
				y: shoulderY
			},
			{
				type: 'quad',
				cx: rightShoulder + sideRound,
				cy: metrics.chestY + 4,
				x: rightWaist + belly,
				y: waistY
			},
			{
				type: 'quad',
				cx: rightHip + sideRound,
				cy: torso.hemY - 15,
				x: rightHip,
				y: torso.hemY - hemLift
			},
			{
				type: 'quad',
				cx: centerX,
				cy: torso.hemY + torso.hemRound,
				x: leftHip,
				y: torso.hemY + hemLift
			},
			{
				type: 'quad',
				cx: leftHip - sideRound,
				cy: torso.hemY - 15,
				x: leftWaist - belly,
				y: waistY
			},
			{
				type: 'quad',
				cx: leftShoulder - sideRound,
				cy: metrics.chestY + 4,
				x: leftShoulder,
				y: shoulderY
			}
		], {
			...LineArtStyle.outer(data, colors.jacket),
			lineJoin: 'round'
		});
	}
}
