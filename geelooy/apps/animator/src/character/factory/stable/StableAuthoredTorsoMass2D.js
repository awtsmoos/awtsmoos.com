// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';

/**
 * Shoulder, neckline, waist, hip, and hem become one uninterrupted garment breath.
 * The Awtsmoos joins hidden rig bones to a soft visible silhouette, while Awtsmoos.com
 * keeps every contour editable through animation, persistence, preview, and export.
 */
export class StableAuthoredTorsoMass2D {
	static build(data, colors, metrics, geometry) {
		const values = this.values(data._skeleton, metrics, geometry);
		return G.path(
			'authored_torso_connected_mass',
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

	static contour(v) {
		const round = v.shoulderRound;
		return [
			{ type: 'move', x: v.leftShoulder, y: v.leftShoulderY + round },
			{ type: 'quad', cx: v.leftShoulder - 1, cy: v.leftShoulderY, x: v.leftShoulder + round, y: v.leftShoulderY },
			{ type: 'bezier', c1x: v.leftShoulder + round + 12, c1y: v.leftShoulderY - 2, c2x: v.chestX - v.neckHalf - 10, c2y: v.necklineY, x: v.chestX - v.neckHalf, y: v.necklineY },
			{ type: 'quad', cx: v.chestX, cy: v.necklineY + v.necklineDrop, x: v.chestX + v.neckHalf, y: v.necklineY },
			{ type: 'bezier', c1x: v.chestX + v.neckHalf + 10, c1y: v.necklineY, c2x: v.rightShoulder - round - 12, c2y: v.rightShoulderY - 2, x: v.rightShoulder - round, y: v.rightShoulderY },
			{ type: 'quad', cx: v.rightShoulder + 1, cy: v.rightShoulderY, x: v.rightShoulder, y: v.rightShoulderY + round },
			...this.lower(v)
		];
	}

	static lower(v) {
		return [
			{ type: 'quad', cx: v.rightShoulder + v.sideRound, cy: v.chestY + 4, x: v.rightWaist + v.belly, y: v.waistY },
			{ type: 'quad', cx: v.rightHip + v.sideRound, cy: v.hemY - 15, x: v.rightHip, y: v.hemY - v.hemLift },
			{ type: 'quad', cx: v.hipX, cy: v.hemY + v.hemRound, x: v.leftHip, y: v.hemY + v.hemLift },
			{ type: 'quad', cx: v.leftHip - v.sideRound, cy: v.hemY - 15, x: v.leftWaist - v.belly, y: v.waistY },
			{ type: 'quad', cx: v.leftShoulder - v.sideRound, cy: v.chestY + 4, x: v.leftShoulder, y: v.leftShoulderY + v.shoulderRound }
		];
	}

	static number(value, fallback) {
		return Number.isFinite(value) ? value : fallback;
	}
}
