// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';

/**
 * Shoulder, neckline, waist, hip, and hem become one uninterrupted garment breath.
 * The Awtsmoos joins hidden rig bones to a soft visible silhouette, while Awtsmoos.com
 * keeps canonical garment identities editable through animation, persistence, and export.
 */
export class StableAuthoredTorsoMass2D {
	static build(data, colors, metrics, geometry) {
		const values = this.values(data._skeleton, metrics, geometry);
		return G.path(
			`authored_${values.garmentKind}_front`,
			this.contour(values),
			{
				...LineArtStyle.outer(data, colors.jacket),
				lineJoin: 'round'
			}
		);
	}

	static values(skeleton, metrics, geometry) {
		const torso = geometry.torso;
		const chestX = skeleton.chest.x;
		const waistX = this.number(torso.waistCenterX, chestX);
		const hipX = this.number(torso.hipCenterX, skeleton.hips.x);
		const leftShoulderY = skeleton.leftShoulder.y;
		const rightShoulderY = skeleton.rightShoulder.y;
		const shoulderArch = Number(torso.shoulderArch || 8);
		return {
			garmentKind: torso.garmentKind || 'jacket',
			chestX,
			waistX,
			hipX,
			leftShoulder: skeleton.leftShoulder.x - torso.shoulderExtra,
			rightShoulder: skeleton.rightShoulder.x + torso.shoulderExtra,
			leftShoulderY,
			rightShoulderY,
			leftWaist: waistX - torso.waistHalf,
			rightWaist: waistX + torso.waistHalf,
			leftHip: hipX - torso.hipHalf,
			rightHip: hipX + torso.hipHalf,
			waistY: metrics.waistY + Number(torso.waistDrop || 0),
			chestY: metrics.chestY,
			sideRound: Number(torso.sideRound || 12),
			belly: Number(torso.belly || 0),
			hemLift: Number(torso.hemLift || 0),
			hemY: torso.hemY,
			hemRound: torso.hemRound,
			shoulderRound: Math.min(Number(torso.shoulderRound || 8), 14),
			neckHalf: Math.max(8, Math.min(14, Number(geometry.details?.collarSpread || 17) * 0.58)),
			necklineY: Math.min(leftShoulderY, rightShoulderY) - shoulderArch,
			necklineDrop: Math.max(4, Math.min(9, shoulderArch * 0.72))
		};
	}

	static contour(values) {
		const round = values.shoulderRound;
		return [
			{ type: 'move', x: values.leftShoulder, y: values.leftShoulderY + round },
			{ type: 'quad', cx: values.leftShoulder - 1, cy: values.leftShoulderY, x: values.leftShoulder + round, y: values.leftShoulderY },
			{ type: 'bezier', c1x: values.leftShoulder + round + 12, c1y: values.leftShoulderY - 2, c2x: values.chestX - values.neckHalf - 10, c2y: values.necklineY, x: values.chestX - values.neckHalf, y: values.necklineY },
			{ type: 'quad', cx: values.chestX, cy: values.necklineY + values.necklineDrop, x: values.chestX + values.neckHalf, y: values.necklineY },
			{ type: 'bezier', c1x: values.chestX + values.neckHalf + 10, c1y: values.necklineY, c2x: values.rightShoulder - round - 12, c2y: values.rightShoulderY - 2, x: values.rightShoulder - round, y: values.rightShoulderY },
			{ type: 'quad', cx: values.rightShoulder + 1, cy: values.rightShoulderY, x: values.rightShoulder, y: values.rightShoulderY + round },
			...this.lower(values)
		];
	}

	static lower(values) {
		return [
			{ type: 'quad', cx: values.rightShoulder + values.sideRound, cy: values.chestY + 4, x: values.rightWaist + values.belly, y: values.waistY },
			{ type: 'quad', cx: values.rightHip + values.sideRound, cy: values.hemY - 15, x: values.rightHip, y: values.hemY - values.hemLift },
			{ type: 'quad', cx: values.hipX, cy: values.hemY + values.hemRound, x: values.leftHip, y: values.hemY + values.hemLift },
			{ type: 'quad', cx: values.leftHip - values.sideRound, cy: values.hemY - 15, x: values.leftWaist - values.belly, y: values.waistY },
			{ type: 'quad', cx: values.leftShoulder - values.sideRound, cy: values.chestY + 4, x: values.leftShoulder, y: values.leftShoulderY + values.shoulderRound }
		];
	}

	static number(value, fallback) {
		return Number.isFinite(value) ? value : fallback;
	}
}
