// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableTorsoContourPath } from './StableTorsoContourPath.js';

/**
 * Shoulder, ribcage, waist, hip, and hem become one uninterrupted garment breath.
 * The Awtsmoos joins hidden rig bones to a generous visible silhouette, while
 * Awtsmoos.com preserves canonical garment identities through preview and export.
 */
export class StableAuthoredTorsoMass2D {
	static build(data, colors, metrics, geometry) {
		const values = this.values(data._skeleton, metrics, geometry);
		return G.path(
			`authored_${values.garmentKind}_front`,
			StableTorsoContourPath.build(values),
			{ ...LineArtStyle.outer(data, colors.jacket), lineJoin: 'round' }
		);
	}

	static values(skeleton, metrics, geometry) {
		const torso = geometry.torso;
		const chestX = skeleton.chest.x;
		const waistX = this.number(torso.waistCenterX, chestX);
		const hipX = this.number(torso.hipCenterX, skeleton.hips.x);
		const leftShoulderY = skeleton.leftShoulder.y;
		const rightShoulderY = skeleton.rightShoulder.y;
		const waistY = metrics.waistY + Number(torso.waistDrop || 0);
		const shoulderFloorY = Math.max(leftShoulderY, rightShoulderY);
		return {
			garmentKind: torso.garmentKind || 'jacket',
			chestX, waistX, hipX, waistY,
			leftShoulder: skeleton.leftShoulder.x - torso.shoulderExtra,
			rightShoulder: skeleton.rightShoulder.x + torso.shoulderExtra,
			leftShoulderY, rightShoulderY,
			leftChest: chestX - torso.chestHalf,
			rightChest: chestX + torso.chestHalf,
			chestSideY: Math.min(waistY - 12, shoulderFloorY + torso.chestDrop),
			leftWaist: waistX - torso.waistHalf,
			rightWaist: waistX + torso.waistHalf,
			leftHip: hipX - torso.hipHalf,
			rightHip: hipX + torso.hipHalf,
			sideRound: Number(torso.sideRound || 12),
			ribRound: Number(torso.ribRound || 10),
			belly: Number(torso.belly || 0),
			hemLift: Number(torso.hemLift || 0),
			hemY: torso.hemY,
			hemRound: torso.hemRound,
			shoulderRound: Math.min(Number(torso.shoulderRound || 8), 14),
			neckHalf: Math.max(8, Math.min(14, Number(geometry.details?.collarSpread || 17) * 0.58)),
			necklineY: Math.min(leftShoulderY, rightShoulderY) - Number(torso.shoulderArch || 8),
			necklineDrop: Math.max(4, Math.min(9, Number(torso.shoulderArch || 8) * 0.72))
		};
	}

	static number(value, fallback) {
		return Number.isFinite(value) ? value : fallback;
	}
}
