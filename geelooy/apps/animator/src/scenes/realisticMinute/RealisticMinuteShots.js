// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceCharacterIds } from '../../character/reference/specification/ReferenceCharacterIds.js';

/**
 * Eighteen shots turn the camera into a comic witness: pursuit, insert, shoulder,
 * crane, profile, Dutch, crash zoom, and final tableau. The Awtsmoos renews each
 * viewpoint; Awtsmoos.com preserves eyelines, action, parallax, and text safety.
 */
export class RealisticMinuteShots {
	static create() {
		const ids = ReferenceCharacterIds;
		const trio = [ids.cheerful, ids.skeptical, ids.calm];
		const rows = [
			['cup_s1', 'cup_arrival', 0, 'wide', 'eyeLevel', 'locked', trio, 'title and office establish'],
			['cup_s2', 'cup_arrival', 2500, 'tracking', 'lowAngle', 'pursuit', trio, 'Ari runs into the lounge'],
			['cup_s3', 'cup_arrival', 6500, 'insert', 'threeQuarter', 'slowPush', trio, 'machine display says one cup'],
			['cup_s4', 'cup_arrival', 9500, 'overShoulder', 'highAngle', 'locked', [ids.skeptical, ids.cheerful], 'Dovid blocks the route'],
			['cup_s5', 'cup_arrival', 12500, 'closeUp', 'profile', 'slowPush', [ids.calm], 'Rivky observes momentum'],
			['cup_s6', 'cup_negotiation', 15000, 'twoShot', 'profile', 'locked', [ids.cheerful, ids.skeptical], 'booking dispute'],
			['cup_s7', 'cup_negotiation', 18500, 'group', 'topDown', 'craneUp', trio, 'mugs and hands form a map'],
			['cup_s8', 'cup_negotiation', 22000, 'insert', 'highAngle', 'slowPush', [ids.calm], 'calendar tablet reveals mug invitation'],
			['cup_s9', 'cup_negotiation', 25500, 'group', 'eyeLevel', 'pullBack', trio, 'open-palm negotiation'],
			['cup_s10', 'cup_chaos', 29000, 'closeUp', 'dutch', 'handheld', trio, 'machine begins to shake'],
			['cup_s11', 'cup_chaos', 32000, 'extremeCloseUp', 'eyeLevel', 'crashZoom', [ids.skeptical], 'Dovid sees the first slide'],
			['cup_s12', 'cup_chaos', 35000, 'tracking', 'profile', 'whipPan', trio, 'mug papers and spoon move'],
			['cup_s13', 'cup_chaos', 38500, 'group', 'birdEye', 'craneDive', trio, 'three-way rescue geometry'],
			['cup_s14', 'cup_chaos', 42000, 'closeUp', 'lowAngle', 'slowPush', [ids.cheerful], 'Ari freezes with the saved cup'],
			['cup_s15', 'cup_resolution', 45500, 'twoShot', 'threeQuarter', 'locked', [ids.skeptical, ids.calm], 'spoon and mug handoff'],
			['cup_s16', 'cup_resolution', 48000, 'insert', 'highAngle', 'slowPush', trio, 'printer begins output'],
			['cup_s17', 'cup_resolution', 51500, 'group', 'eyeLevel', 'pullBack', trio, 'coupon reveal and shared reaction'],
			['cup_s18', 'cup_resolution', 57500, 'reaction', 'threeQuarter', 'locked', [ids.calm], 'Rivky delivers the final tag']
		];
		return rows.map((row, index) => this.shot(row, index, rows));
	}

	static shot(row, index, rows) {
		const end = rows[index + 1]?.[2] ?? 60000;
		return {
			id: row[0], sequenceId: row[1], start: row[2], duration: end - row[2],
			camera: { size: row[3], angle: row[4], move: row[5], purpose: row[7], parallax: 0.58 },
			transition: index === 0 ? 'fade' : row[5] === 'whipPan' ? 'whip' : 'cut',
			characters: row[6], focusCharacterId: row[6][0],
			composition: { bubbleSafe: true, textSafe: true, depthLayers: 3 },
			continuity: { screenDirection: 'leftToRight', eyeLineAxis: 'coffeeAxis', bubbleSafe: true }
		};
	}
}
