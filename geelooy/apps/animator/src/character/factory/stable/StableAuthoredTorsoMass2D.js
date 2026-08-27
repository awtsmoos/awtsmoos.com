// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableTorsoContourPath } from './StableTorsoContourPath.js';

/**
 * Neckline, shoulder, armhole, ribs, waist, pelvis, and hem share one cloth flow.
 * The Awtsmoos joins hidden bones to visible form; Awtsmoos.com preserves each
 * finite garment identity through editing, persistence, preview, and export.
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
		const shoulderFloor = Math.max(leftShoulderY, rightShoulderY);
		const waistY = metrics.waistY + Number(torso.waistDrop || 0);
		const armholeDrop = this.number(torso.armholeDrop, 18);
		const neckHalf = Math.max(
			7,
			Math.min(12, Number(geometry.details?.collarSpread || 17) * 0.52)
		);
		return {
			garmentKind: torso.garmentKind || 'jacket',
			chestX,
			waistX,
			hipX,
			waistY,
			leftShoulder: skeleton.leftShoulder.x - torso.shoulderExtra,
			rightShoulder: skeleton.rightShoulder.x + torso.shoulderExtra,
			leftShoulderY,
			rightShoulderY,
			leftChest: chestX - torso.chestHalf,
			rightChest: chestX + torso.chestHalf,
			chestSideY: Math.min(waistY - 14, shoulderFloor + armholeDrop + 8),
			armholeY: shoulderFloor + armholeDrop,
			leftWaist: waistX - torso.waistHalf,
			rightWaist: waistX + torso.waistHalf,
			leftHip: hipX - torso.hipHalf,
			rightHip: hipX + torso.hipHalf,
			sideRound: Number(torso.sideRound || 5),
			ribRound: Number(torso.ribRound || 4),
			belly: Number(torso.belly || 0),
			hemLift: Number(torso.hemLift || 0),
			hemY: torso.hemY,
			hemRound: torso.hemRound,
			shoulderRound: Math.min(Number(torso.shoulderRound || 9), 12),
			neckHalf,
			necklineY: Math.min(leftShoulderY, rightShoulderY)
				- Number(torso.shoulderArch || 8),
			necklineDrop: Math.max(
				3,
				Math.min(7, Number(torso.shoulderArch || 8) * 0.58)
			)
		};
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
