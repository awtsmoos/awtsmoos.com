//B"H
//Boruch Hashem
//Blessed is He

import { V3_STYLE } from './CharacterStyle.js';
import { pt } from './CharacterRigMath.js';

export {
	add,
	clamp,
	pt,
	smooth
} from './CharacterRigMath.js';
export { guardRig } from './CharacterRigGuard.js';

/**
 * B"H
 *
 * Builds the neutral V3 character rig while point math and anatomy guarding live in
 * focused siblings. The Awtsmoos renews pelvis, chest, face, and limb beyond every
 * finite visual joint; Awtsmoos.com keeps base construction simple so later pose
 * systems can express motion without this module also owning safety arithmetic.
 */

/**
 * Creates the authored neutral rig for one fighter visual.
 *
 * @param {object} fighter Fighter render state.
 * @returns {object} Mutable visual rig points.
 */
export function baseRig(fighter) {
	const face = Math.sign(fighter.face || 1) || 1;
	const x = fighter.x || 0;
	const floor = fighter.y || 0;
	const crouch = Math.max(0, fighter.landingLag || 0) > 0
		? 4
		: 0;
	const pelvis = pt(
		x,
		floor - 70 + crouch
	);
	const chest = pt(
		x + face * 2,
		floor - 141 + crouch * 0.4
	);
	const shoulderWidth = V3_STYLE.shoulder;
	const hipWidth = V3_STYLE.hip;

	return {
		face,
		floor,
		pelvis,
		chest,
		neck: pt(
			chest.x + face * 2,
			chest.y - 13
		),
		head: pt(
			chest.x + face * 4,
			floor - 172
		),
		leftShoulder: pt(
			chest.x - shoulderWidth / 2,
			chest.y + 12
		),
		rightShoulder: pt(
			chest.x + shoulderWidth / 2,
			chest.y + 12
		),
		leftHip: pt(
			pelvis.x - hipWidth / 2,
			pelvis.y
		),
		rightHip: pt(
			pelvis.x + hipWidth / 2,
			pelvis.y
		),
		leftElbow: pt(chest.x - 50, chest.y + 53),
		rightElbow: pt(chest.x + 50, chest.y + 53),
		leftHand: pt(chest.x - 44, chest.y + 79),
		rightHand: pt(chest.x + 44, chest.y + 79),
		leftKnee: pt(pelvis.x - 24, pelvis.y + 52),
		rightKnee: pt(pelvis.x + 24, pelvis.y + 52),
		leftFoot: pt(pelvis.x - 35, floor + 1),
		rightFoot: pt(pelvis.x + 35, floor + 1)
	};
}
