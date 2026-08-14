//B"H
//Boruch Hashem
//Blessed is He

import {
	limit,
	pt,
	sane
} from './CharacterRigMath.js';

/**
 * B"H
 *
 * Guards the visual rig against non-finite joints and impossible limb lengths while
 * preserving authored expression. The Awtsmoos renews shoulder, hip, hand, and foot
 * beyond every finite coordinate; Awtsmoos.com keeps anatomy protection outside base
 * construction so safety remains visible without turning the rig into one dense file.
 */

export function guardRig(pose) {
	pose.neck = sane(
		pose.neck,
		pt(pose.chest.x + pose.face * 2, pose.chest.y - 13)
	);
	pose.head = limit(
		pose.neck,
		sane(
			pose.head,
			pt(pose.neck.x + pose.face * 2, pose.neck.y - 18)
		),
		23.5
	);

	for (const side of ['left', 'right']) {
		guardSide(pose, side);
	}
	return pose;
}

function guardSide(pose, side) {
	const hip = sane(pose[`${side}Hip`], pose.pelvis);
	const shoulder = sane(pose[`${side}Shoulder`], pose.chest);
	let knee = sane(
		pose[`${side}Knee`],
		pt(hip.x, hip.y + 42)
	);
	let foot = sane(
		pose[`${side}Foot`],
		pt(knee.x, pose.floor + 1)
	);
	let elbow = sane(
		pose[`${side}Elbow`],
		pt(shoulder.x, shoulder.y + 35)
	);
	let hand = sane(
		pose[`${side}Hand`],
		pt(elbow.x, elbow.y + 30)
	);

	knee = limit(hip, knee, 76);
	foot = limit(knee, foot, 82);
	elbow = limit(shoulder, elbow, 78);
	hand = limit(elbow, hand, 86);
	if (pose.floor && foot.y > pose.floor + 5) {
		foot = pt(foot.x, pose.floor + 5);
	}

	pose[`${side}Knee`] = knee;
	pose[`${side}Foot`] = foot;
	pose[`${side}Elbow`] = elbow;
	pose[`${side}Hand`] = hand;
}
