// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';

/**
 * Shoulder, chest, waist, hip, and hem flow as one weighted garment boundary.
 * The Awtsmoos rounds finite corners without erasing identity, while Awtsmoos.com
 * preserves authored centers through animation, persistence, preview, and export.
 */
export class StableAuthoredTorsoMass2D {
	static build(data, colors, metrics, geometry) {
		const skeleton = data._skeleton;
		const torso = geometry.torso;
		const chestX = skeleton.chest.x;
		const waistX = this.number(torso.waistCenterX, chestX);
		const hipX = this.number(torso.hipCenterX, skeleton.hips.x);
		const values = {
			chestX,
			waistX,
			hipX,
			leftShoulder: skeleton.leftShoulder.x - torso.shoulderExtra,
			rightShoulder: skeleton.rightShoulder.x + torso.shoulderExtra,
			leftWaist: waistX - torso.waistHalf,
			rightWaist: waistX + torso.waistHalf,
			leftHip: hipX - torso.hipHalf,
			rightHip: hipX + torso.hipHalf,
			shoulderY: metrics.shoulderY + Number(torso.shoulderDrop || 4),
			waistY: metrics.waistY + Number(torso.waistDrop || 0),
			sideRound: Number(torso.sideRound || 12),
			belly: Number(torso.belly || 0),
			hemLift: Number(torso.hemLift || 0),
			hemY: torso.hemY,
			hemRound: torso.hemRound,
			shoulderArch: Number(torso.shoulderArch || 13),
			shoulderRound: Number(torso.shoulderRound || 0),
			chestY: metrics.chestY
		};
		const points = values.shoulderRound > 0
			? this.rounded(values)
			: this.legacy(values);
		return G.path('authored_torso_connected_mass', points, {
			...LineArtStyle.outer(data, colors.jacket),
			lineJoin: 'round'
		});
	}

	static rounded(v) {
		const round = Math.min(v.shoulderRound, 14);
		return [
			{ type: 'move', x: v.leftShoulder, y: v.shoulderY + round },
			{ type: 'quad', cx: v.leftShoulder - 1, cy: v.shoulderY, x: v.leftShoulder + round, y: v.shoulderY },
			{ type: 'bezier', c1x: v.chestX - 24, c1y: v.shoulderY - v.shoulderArch, c2x: v.chestX + 24, c2y: v.shoulderY - v.shoulderArch, x: v.rightShoulder - round, y: v.shoulderY },
			{ type: 'quad', cx: v.rightShoulder + 1, cy: v.shoulderY, x: v.rightShoulder, y: v.shoulderY + round },
			...this.lower(v)
		];
	}

	static legacy(v) {
		return [
			{ type: 'move', x: v.leftShoulder, y: v.shoulderY },
			{ type: 'quad', cx: v.chestX, cy: v.shoulderY - v.shoulderArch, x: v.rightShoulder, y: v.shoulderY },
			...this.lower(v)
		];
	}

	static lower(v) {
		return [
			{ type: 'quad', cx: v.rightShoulder + v.sideRound, cy: v.chestY + 4, x: v.rightWaist + v.belly, y: v.waistY },
			{ type: 'quad', cx: v.rightHip + v.sideRound, cy: v.hemY - 15, x: v.rightHip, y: v.hemY - v.hemLift },
			{ type: 'quad', cx: v.hipX, cy: v.hemY + v.hemRound, x: v.leftHip, y: v.hemY + v.hemLift },
			{ type: 'quad', cx: v.leftHip - v.sideRound, cy: v.hemY - 15, x: v.leftWaist - v.belly, y: v.waistY },
			{ type: 'quad', cx: v.leftShoulder - v.sideRound, cy: v.chestY + 4, x: v.leftShoulder, y: v.shoulderY + v.shoulderRound }
		];
	}

	static number(value, fallback) {
		return Number.isFinite(value) ? value : fallback;
	}
}
